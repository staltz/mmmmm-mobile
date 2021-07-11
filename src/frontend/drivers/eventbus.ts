/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {FeedId, MsgId} from 'ssb-typescript';

export interface LocalizationLoaded {
  type: 'localizationLoaded';
}

export interface TriggerFeedCypherlink {
  type: 'triggerFeedCypherlink';
  feedId: FeedId;
}

export interface TriggerMsgCypherlink {
  type: 'triggerMsgCypherlink';
  msgId: MsgId;
}

export interface HardwareBackOnCentralScreen {
  type: 'hardwareBackOnCentralScreen';
}

export interface DrawerToggleOnCentralScreen {
  type: 'drawerToggleOnCentralScreen';
  open: boolean;
}

export interface AudioBlobComposed {
  type: 'audioBlobComposed';
  blobId: string;
}

export interface PickerToggled {
  type: 'pickerToggled';
  open: boolean;
  content: string;
}

export type GlobalEvent =
  | LocalizationLoaded
  | TriggerFeedCypherlink
  | TriggerMsgCypherlink
  | HardwareBackOnCentralScreen
  | DrawerToggleOnCentralScreen
  | AudioBlobComposed
  | PickerToggled;

export class EventBus {
  public _stream?: Stream<GlobalEvent>;

  public dispatch(event: GlobalEvent) {
    if (this._stream) {
      this._stream._n(event);
    } else {
      console.error(
        'Global event bus was not prepared but dispatch was called',
      );
    }
  }
}

export const GlobalEventBus = new EventBus();

export function makeEventBusDriver() {
  const response$ = xs.create<GlobalEvent>();
  GlobalEventBus._stream = response$;

  return function eventBusDriver(
    sink$: Stream<GlobalEvent>,
  ): Stream<GlobalEvent> {
    return xs.merge(response$, sink$);
  };
}
