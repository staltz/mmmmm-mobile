/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement, Fragment, PureComponent, Component} from 'react';
import {
  View,
  Text,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FloatingAction} from 'react-native-floating-action';
import {MenuProvider} from 'react-native-popup-menu';
import {IFloatingActionProps as FabProps} from 'react-native-floating-action';
import {t} from '../../drivers/localization';
import {styles, iconProps} from './styles';
import {State} from './model';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

const touchableProps: any = {};
if (Platform.OS === 'android') {
  touchableProps.background = TouchableNativeFeedback.SelectableBackground();
}

class CurrentTabPage extends PureComponent<{
  currentTab: State['currentTab'];
  fab: FabProps;
  publicTab: ReactElement<any>;
  privateTab: ReactElement<any>;
  activityTab: ReactElement<any>;
  connectionsTab: ReactElement<any>;
}> {
  public render() {
    const {
      currentTab,
      fab,
      publicTab,
      privateTab,
      activityTab,
      connectionsTab,
    } = this.props;
    const shown = styles.pageShown;
    const hidden = styles.pageHidden;

    return h(Fragment, [
      h(View, {style: [currentTab === 'public' ? shown : hidden]}, [
        publicTab,
        h(FloatingAction, fab),
      ]),
      h(View, {style: [currentTab === 'private' ? shown : hidden]}, [
        privateTab,
        h(FloatingAction, fab),
      ]),
      h(View, {style: [currentTab === 'activity' ? shown : hidden]}, [
        activityTab,
      ]),
      h(View, {style: [currentTab === 'connections' ? shown : hidden]}, [
        connectionsTab,
        h(FloatingAction, fab),
      ]),
    ]);
  }
}

class PublicTabIcon extends Component<{
  isSelected: boolean;
  numOfUpdates: number;
}> {
  public shouldComponentUpdate(nextProps: PublicTabIcon['props']) {
    const prevProps = this.props;
    if (nextProps.isSelected !== prevProps.isSelected) return true;
    const nextNum = nextProps.numOfUpdates;
    const prevNum = prevProps.numOfUpdates;
    // numOfUpdates has two thresholds: >=1 and >=10
    if (prevNum === nextNum) return false;
    if (prevNum < 1 && nextNum >= 1) return true;
    if (prevNum < 10 && nextNum >= 10) return true;
    if (prevNum >= 10 && nextNum < 10) return true;
    if (prevNum >= 1 && nextNum < 1) return true;
    return false;
  }

  public render() {
    const {isSelected, numOfUpdates} = this.props;

    return h(
      Touchable,
      {
        ...touchableProps,
        sel: 'public-tab-button',
        style: styles.tabButton, // iOS needs this
        accessible: true,
        accessibilityRole: 'tab',
        accessibilityLabel: t('central.tabs.public.accessibility_label'),
      },
      [
        h(View, {style: styles.tabButton, pointerEvents: 'box-only'}, [
          h(View, [
            h(Icon, {
              name: 'bulletin-board',
              ...(isSelected ? iconProps.tabSelected : iconProps.tab),
            }),
            h(View, {
              style:
                numOfUpdates >= 10
                  ? styles.updatesCoverNone
                  : numOfUpdates >= 1
                  ? styles.updatesCoverSome
                  : styles.updatesCoverAll,
            }),
          ]),

          h(
            Text,
            {
              style: isSelected
                ? styles.tabButtonTextSelected
                : styles.tabButtonText,
              numberOfLines: 1,
            },
            t('central.tab_footers.public'),
          ),
        ]),
      ],
    );
  }
}

class PrivateTabIcon extends Component<{
  isSelected: boolean;
  numOfUpdates: number;
}> {
  public shouldComponentUpdate(nextProps: PrivateTabIcon['props']) {
    const prevProps = this.props;
    if (nextProps.isSelected !== prevProps.isSelected) return true;
    // numOfPrivateUpdates has one threshold: >=1
    const nextNum = nextProps.numOfUpdates;
    const prevNum = prevProps.numOfUpdates;
    if (prevNum === nextNum) return false;
    if (prevNum < 1 && nextNum >= 1) return true;
    if (prevNum >= 1 && nextNum < 1) return true;
    return false;
  }

  public render() {
    const {isSelected, numOfUpdates} = this.props;
    return h(
      Touchable,
      {
        ...touchableProps,
        sel: 'private-tab-button',
        style: styles.tabButton, // iOS needs this
        accessible: true,
        accessibilityRole: 'tab',
        accessibilityLabel: t('central.tabs.private.accessibility_label'),
      },
      [
        h(View, {style: styles.tabButton, pointerEvents: 'box-only'}, [
          h(View, [
            h(Icon, {
              name:
                numOfUpdates >= 1 ? 'message-text-outline' : 'message-outline',
              ...(isSelected ? iconProps.tabSelected : iconProps.tab),
            }),
          ]),

          h(
            Text,
            {
              style: isSelected
                ? styles.tabButtonTextSelected
                : styles.tabButtonText,
              numberOfLines: 1,
            },
            t('central.tab_footers.private'),
          ),
        ]),
      ],
    );
  }
}

class ActivityTabIcon extends Component<{
  isSelected: boolean;
  numOfUpdates: number;
}> {
  public shouldComponentUpdate(nextProps: ActivityTabIcon['props']) {
    const prevProps = this.props;
    if (nextProps.isSelected !== prevProps.isSelected) return true;
    // numOfActivityUpdates has one threshold: >=1
    const nextNum = nextProps.numOfUpdates;
    const prevNum = prevProps.numOfUpdates;
    if (prevNum === nextNum) return false;
    if (prevNum < 1 && nextNum >= 1) return true;
    if (prevNum >= 1 && nextNum < 1) return true;
    return false;
  }

  public render() {
    const {isSelected, numOfUpdates} = this.props;
    return h(
      Touchable,
      {
        ...touchableProps,
        sel: 'activity-tab-button',
        style: styles.tabButton, // iOS needs this
        accessible: true,
        accessibilityRole: 'tab',
        accessibilityLabel: t('central.tabs.activity.accessibility_label'),
      },
      [
        h(View, {style: styles.tabButton, pointerEvents: 'box-only'}, [
          h(View, [
            h(Icon, {
              name: numOfUpdates >= 1 ? 'bell-ring-outline' : 'bell-outline',
              ...(isSelected ? iconProps.tabSelected : iconProps.tab),
            }),
          ]),

          h(
            Text,
            {
              style: isSelected
                ? styles.tabButtonTextSelected
                : styles.tabButtonText,
              numberOfLines: 1,
            },
            t('central.tab_footers.activity'),
          ),
        ]),
      ],
    );
  }
}

class ConnectionsTabIcon extends Component<{
  isSelected: boolean;
  details: State['connectionsTab'];
}> {
  private static countConnected(d: ConnectionsTabIcon['props']['details']) {
    return (d?.peers ?? []).filter((p) => p[1].state === 'connected').length;
  }

  private static countStaged(d: ConnectionsTabIcon['props']['details']) {
    return (d?.stagedPeers ?? []).length;
  }

  public shouldComponentUpdate(nextProps: ConnectionsTabIcon['props']) {
    const prevProps = this.props;
    // Compare isSelected:
    if (nextProps.isSelected !== prevProps.isSelected) return true;

    // Don't look into `details` object if the object has not changed:
    const nextDetails = nextProps.details;
    const prevDetails = prevProps.details;
    if (nextDetails === prevDetails) return false;

    // Compare fooEnabled fields:
    const nextEnabled =
      nextDetails?.bluetoothEnabled ||
      nextDetails?.internetEnabled ||
      nextDetails?.lanEnabled;
    const prevEnabled =
      prevDetails?.bluetoothEnabled ||
      prevDetails?.internetEnabled ||
      prevDetails?.lanEnabled;
    if (nextEnabled !== prevEnabled) return true;

    // Compare peers.length (has one threshold, >=1):
    const prevNumConnected = ConnectionsTabIcon.countConnected(prevDetails);
    const nextNumConnected = ConnectionsTabIcon.countConnected(nextDetails);
    if (prevNumConnected === nextNumConnected) return false;
    if (prevNumConnected < 1 && nextNumConnected >= 1) return true;
    if (prevNumConnected >= 1 && nextNumConnected < 1) return true;

    // Compare stagedPeers.length (has one threshold, >=1):
    const prevNumStaged = ConnectionsTabIcon.countStaged(prevDetails);
    const nextNumStaged = ConnectionsTabIcon.countStaged(nextDetails);
    if (prevNumStaged === nextNumStaged) return false;
    if (prevNumStaged < 1 && nextNumStaged >= 1) return true;
    if (prevNumStaged >= 1 && nextNumStaged < 1) return true;

    return false;
  }

  private getIconName() {
    const {details} = this.props;
    if (ConnectionsTabIcon.countConnected(details) > 0) {
      return 'check-network-outline';
    }
    if (ConnectionsTabIcon.countStaged(details) > 0) {
      return 'help-network-outline';
    }
    const d = details;
    if (d?.bluetoothEnabled || d?.internetEnabled || d?.lanEnabled) {
      return 'network-outline';
    }
    return 'network-off-outline';
  }

  public render() {
    const {isSelected} = this.props;
    return h(
      Touchable,
      {
        ...touchableProps,
        sel: 'connections-tab-button',
        style: styles.tabButton, // iOS needs this
        accessible: true,
        accessibilityRole: 'tab',
        accessibilityLabel: t('central.tabs.connections.accessibility_label'),
      },
      [
        h(View, {style: styles.tabButton, pointerEvents: 'box-only'}, [
          h(Icon, {
            name: this.getIconName(),
            ...(isSelected ? iconProps.tabSelected : iconProps.tab),
          }),

          h(
            Text,
            {
              style: isSelected
                ? styles.tabButtonTextSelected
                : styles.tabButtonText,
              numberOfLines: 1,
            },
            t('central.tab_footers.connections'),
          ),
        ]),
      ],
    );
  }
}

class TabsBar extends Component<State> {
  public shouldComponentUpdate(nextProps: TabsBar['props']) {
    const prevProps = this.props;
    if (nextProps.currentTab !== prevProps.currentTab) return true;
    if (nextProps.numOfPublicUpdates !== prevProps.numOfPublicUpdates) {
      return true;
    }
    if (nextProps.numOfPrivateUpdates !== prevProps.numOfPrivateUpdates) {
      return true;
    }
    if (nextProps.numOfActivityUpdates !== prevProps.numOfActivityUpdates) {
      return true;
    }
    if (nextProps.connectionsTab !== prevProps.connectionsTab) {
      return true;
    }
    return false;
  }

  public render() {
    const {currentTab} = this.props;
    return h(View, {style: styles.tabBar}, [
      h(PublicTabIcon, {
        isSelected: currentTab === 'public',
        numOfUpdates: this.props.numOfPublicUpdates,
      }),
      h(PrivateTabIcon, {
        isSelected: currentTab === 'private',
        numOfUpdates: this.props.numOfPrivateUpdates,
      }),
      h(ActivityTabIcon, {
        isSelected: currentTab === 'activity',
        numOfUpdates: this.props.numOfActivityUpdates,
      }),
      h(ConnectionsTabIcon, {
        isSelected: currentTab === 'connections',
        details: this.props.connectionsTab,
      }),
    ]);
  }
}

export default function view(
  state$: Stream<State>,
  fabProps$: Stream<FabProps>,
  topBar$: Stream<ReactElement<any>>,
  publicTab$: Stream<ReactElement<any>>,
  privateTab$: Stream<ReactElement<any>>,
  activityTab$: Stream<ReactElement<any>>,
  connectionsTab$: Stream<ReactElement<any>>,
) {
  return xs
    .combine(
      state$,
      fabProps$,
      topBar$,
      publicTab$.startWith(h(View)),
      privateTab$.startWith(h(View)),
      activityTab$.startWith(h(View)),
      connectionsTab$.startWith(h(View)),
    )
    .map(
      ([
        state,
        fabProps,
        topBar,
        publicTab,
        privateTab,
        activityTab,
        connectionsTab,
      ]) =>
        h(MenuProvider, {customStyles: {backdrop: styles.menuBackdrop}}, [
          h(Modal, {transparent: true, visible: state.isPickerOpen}, [
            h(View, {style: {backgroundColor: 'white'}}, [
              h(Text, state.pickerContent),
            ]),
          ]),
          h(View, {style: styles.root}, [
            // h(RNBridgeDebug),
            topBar,
            h(CurrentTabPage, {
              currentTab: state.currentTab,
              fab: fabProps,
              publicTab,
              privateTab,
              activityTab,
              connectionsTab,
            }),
            h(TabsBar, state),
          ]),
        ]),
    );
}
