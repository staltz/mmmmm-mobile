/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Msg} from 'ssb-typescript';
import {Platform} from 'react-native';
import {t} from '../drivers/localization';
import {DialogSource} from '../drivers/dialogs';
import {Toast, Duration} from '../drivers/toast';
import {Palette} from '../global-styles/palette';

export type EtcChoiceId = 'copy-id' | 'raw-msg';

export type Sources = {
  appear$: Stream<Msg>;
  dialog: DialogSource;
};

export type Sinks = {
  clipboard: Stream<string>;
  toast: Stream<Toast>;
  goToRawMsg$: Stream<Msg>;
};

export default function messageEtc(sources: Sources): Sinks {
  const messageEtcChoice$ = sources.appear$
    .debug('messageEtc appear')
    .map((msg) =>
      sources.dialog
        .showPicker(
          Platform.OS === 'ios'
            ? t('message.call_to_action.etc.dialog_title')
            : undefined,
          undefined,
          {
            items: [
              {label: t('message.call_to_action.copy_msg_id'), id: 'copy-id'},
              {label: t('message.call_to_action.view_raw'), id: 'raw-msg'},
            ],
            type: 'listPlain',
            contentColor: Palette.colors.comet8,
            cancelable: true,
            positiveText: '',
            negativeText: '',
            neutralText: '',
          },
        )
        .filter((res) => res.action === 'actionSelect')
        .map((res: any) => ({id: res.selectedItem.id as EtcChoiceId, msg})),
    )
    .flatten();

  const goToRawMsg$ = messageEtcChoice$
    .filter((choice) => choice.id === 'raw-msg')
    .map((choice) => choice.msg);

  const copyCypherlink$ = messageEtcChoice$
    .filter((choice) => choice.id === 'copy-id')
    .map((choice) => choice.msg.key);

  const toast$ = copyCypherlink$.mapTo({
    type: 'show',
    message: t('message.toast.copied_to_clipboard'),
    duration: Duration.SHORT,
  } as Toast);

  return {
    clipboard: copyCypherlink$,
    toast: toast$,
    goToRawMsg$,
  };
}
