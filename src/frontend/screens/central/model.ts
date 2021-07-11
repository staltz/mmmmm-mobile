/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Reducer, Lens} from '@cycle/state';
import {Animated} from 'react-native';
import {FeedId, MsgId} from 'ssb-typescript';
import {State as TopBarState} from './top-bar';
import {State as PublicTabState} from './public-tab/model';
import {State as PrivateTabState} from './private-tab/model';
import {State as ActivityTabState} from './activity-tab/model';
import {State as ConnectionsTabState} from './connections-tab/model';
import {SSBSource} from '../../drivers/ssb';
import {PickerToggled} from '../../drivers/eventbus';

export type State = {
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  selfAvatarUrl?: string;
  currentTab: 'public' | 'private' | 'activity' | 'connections';
  scrollHeaderBy: Animated.Value;
  publicTab?: PublicTabState;
  privateTab?: PrivateTabState;
  activityTab?: ActivityTabState;
  connectionsTab?: ConnectionsTabState;
  numOfPublicUpdates: number;
  numOfPrivateUpdates: number;
  numOfActivityUpdates: number;
  migrationProgress: number;
  indexingProgress: number;
  canPublishSSB: boolean;
  isDrawerOpen: boolean;
  isPickerOpen: boolean;
  pickerContent: string;
};

/**
 * Identity lens
 */
export const topBarLens: Lens<State, TopBarState> = {
  get: (parent: State): TopBarState => {
    return parent;
  },

  set: (parent: State, child: TopBarState): State => {
    return parent;
  },
};

export const publicTabLens: Lens<State, PublicTabState> = {
  get: (parent: State): PublicTabState => {
    const isVisible = parent.currentTab === 'public';
    const {selfFeedId, selfAvatarUrl, canPublishSSB} = parent;
    if (parent.publicTab) {
      return {
        ...parent.publicTab,
        isVisible,
        selfFeedId,
        selfAvatarUrl,
        canPublishSSB,
      };
    } else {
      return {
        isVisible,
        selfFeedId,
        lastSessionTimestamp: parent.lastSessionTimestamp,
        selfAvatarUrl,
        getPublicFeedReadable: null,
        numOfUpdates: parent.numOfPublicUpdates,
        hasComposeDraft: false,
        canPublishSSB,
        scrollHeaderBy: parent.scrollHeaderBy,
      };
    }
  },

  set: (parent: State, child: PublicTabState): State => {
    return {
      ...parent,
      numOfPublicUpdates: child.numOfUpdates,
      lastSessionTimestamp: child.lastSessionTimestamp,
      publicTab: child,
    };
  },
};

export const privateTabLens: Lens<State, PrivateTabState> = {
  get: (parent: State): PrivateTabState => {
    const isVisible = parent.currentTab === 'private';
    const {selfFeedId, selfAvatarUrl} = parent;
    if (parent.privateTab) {
      return {...parent.privateTab, isVisible, selfFeedId, selfAvatarUrl};
    } else {
      return {
        isVisible,
        selfFeedId,
        selfAvatarUrl,
        getPrivateFeedReadable: null,
        updates: new Set<MsgId>(),
        updatesFlag: false,
        conversationsOpen: new Map(),
      };
    }
  },

  set: (parent: State, child: PrivateTabState): State => {
    return {
      ...parent,
      numOfPrivateUpdates: child.updates.size,
      privateTab: child,
    };
  },
};

export const activityTabLens: Lens<State, ActivityTabState> = {
  get: (parent: State): ActivityTabState => {
    const isVisible = parent.currentTab === 'activity';
    const {selfFeedId, selfAvatarUrl} = parent;
    if (parent.activityTab) {
      return {...parent.activityTab, isVisible, selfFeedId, selfAvatarUrl};
    } else {
      return {
        isVisible,
        selfFeedId,
        selfAvatarUrl,
        lastSessionTimestamp: parent.lastSessionTimestamp,
        numOfUpdates: parent.numOfActivityUpdates,
        getActivityFeedReadable: null,
      };
    }
  },

  set: (parent: State, child: ActivityTabState): State => {
    return {
      ...parent,
      numOfActivityUpdates: child.numOfUpdates,
      activityTab: child,
    };
  },
};

export const connectionsTabLens: Lens<State, ConnectionsTabState> = {
  get: (parent: State): ConnectionsTabState => {
    const isVisible = parent.currentTab === 'connections';
    const {selfFeedId, selfAvatarUrl} = parent;
    if (parent.connectionsTab) {
      return {...parent.connectionsTab, isVisible, selfFeedId, selfAvatarUrl};
    } else {
      return {
        isVisible,
        selfFeedId,
        selfAvatarUrl,
        bluetoothEnabled: false,
        lanEnabled: false,
        internetEnabled: false,
        bluetoothLastScanned: 0,
        peers: [],
        rooms: [],
        stagedPeers: [],
        timestampPeersAndRooms: 0,
        timestampStagedPeers: 0,
        timestampPeerStates: 0,
        itemMenu: {opened: false, type: 'conn'},
        latestInviteMenuTarget: void 0,
      };
    }
  },

  set: (parent: State, child: ConnectionsTabState): State => {
    return {
      ...parent,
      connectionsTab: child,
    };
  },
};

export type Actions = {
  changeTab$: Stream<State['currentTab']>;
  backToPublicTab$: Stream<null>;
  drawerToggled$: Stream<boolean>;
  pickerToggled$: Stream<PickerToggled>;
};

export default function model(
  actions: Actions,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) {
      return prev;
    } else {
      return {
        selfFeedId: '',
        lastSessionTimestamp: Infinity,
        currentTab: 'public',
        numOfPublicUpdates: 0,
        numOfPrivateUpdates: 0,
        numOfActivityUpdates: 0,
        migrationProgress: 0,
        indexingProgress: 0,
        scrollHeaderBy: new Animated.Value(0),
        isDrawerOpen: false,
        isPickerOpen: false,
        pickerContent: '',
        canPublishSSB: true,
      };
    }
  });

  const setSelfFeedId$ = ssbSource.selfFeedId$.map(
    (selfFeedId) =>
      function setSelfFeedId(prev: State): State {
        return {...prev, selfFeedId};
      },
  );

  const aboutReducer$ = ssbSource.selfFeedId$
    .take(1)
    .map((selfFeedId) => ssbSource.profileImage$(selfFeedId))
    .flatten()
    .map(
      (selfAvatarUrl) =>
        function aboutReducer(prev: State): State {
          return {...prev, selfAvatarUrl};
        },
    );

  const migrationProgressReducer$ = ssbSource.migrationProgress$.map(
    (migrationProgress) =>
      function migrationProgressReducer(prev: State): State {
        const canPublishSSB = migrationProgress >= 1;
        return {...prev, migrationProgress, canPublishSSB};
      },
  );

  const indexingProgressReducer$ = ssbSource.indexingProgress$.map(
    (indexingProgress) =>
      function indexingProgressReducer(prev: State): State {
        return {...prev, indexingProgress};
      },
  );

  const changeTabReducer$ = actions.changeTab$.map(
    (nextTab) =>
      function changeTabReducer(prev: State): State {
        return {...prev, currentTab: nextTab};
      },
  );

  const backToPublicTabReducer$ = actions.backToPublicTab$.map(
    () =>
      function changeTabReducer(prev: State): State {
        return {...prev, currentTab: 'public'};
      },
  );

  const isDrawerOpenReducer$ = actions.drawerToggled$.map(
    (isOpen) =>
      function isDrawerOpenReducer(prev: State): State {
        return {...prev, isDrawerOpen: isOpen};
      },
  );

  const pickerToggledReducer$ = actions.pickerToggled$.map(
    (pickerInfo) =>
      function pickerToggledReducer(prev: State): State {
        return {
          ...prev,
          isPickerOpen: pickerInfo.open,
          pickerContent: pickerInfo.content,
        };
      },
  );

  return xs.merge(
    initReducer$,
    setSelfFeedId$,
    aboutReducer$,
    migrationProgressReducer$,
    indexingProgressReducer$,
    changeTabReducer$,
    backToPublicTabReducer$,
    isDrawerOpenReducer$,
    pickerToggledReducer$,
  );
}
