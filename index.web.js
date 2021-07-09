/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {withState} from '@cycle/state';
import {asyncStorageDriver} from 'cycle-native-asyncstorage';
import {run, GlobalScreen} from 'cycle-native-navigation-web';
import {ssbDriver} from './lib/frontend/drivers/ssb';
import {makeFSDriver} from './lib/frontend/drivers/fs';
import {makeEventBusDriver} from './lib/frontend/drivers/eventbus';
import {makeLocalizationDriver} from './lib/frontend/drivers/localization';
import {central} from './lib/frontend/screens/central';
import {compose} from './lib/frontend/screens/compose';
import {global} from './lib/frontend/screens/global';
import {welcome} from './lib/frontend/screens/welcome';
import {profile} from './lib/frontend/screens/profile';
import {thread} from './lib/frontend/screens/thread';
import {accounts} from './lib/frontend/screens/accounts';
import {secretOutput} from './lib/frontend/screens/secret-output';
import {secretInput} from './lib/frontend/screens/secret-input';
import {Screens} from './lib/frontend/screens/enums';
import {welcomeLayout} from './lib/frontend/screens/layouts';
const iconFont = require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf');

const iconFontStyles = `@font-face {
   src: url(dist/${iconFont});
   font-family: MaterialCommunityIcons;
 }`;
const style = document.createElement('style');
style.appendChild(document.createTextNode(iconFontStyles));
document.head.appendChild(style);

const drivers = {
  asyncstorage: asyncStorageDriver,
  ssb: ssbDriver,
  fs: makeFSDriver(),
  network: () => ({
    bluetoothIsEnabled: () => xs.of(false),
    wifiIsEnabled: () => xs.of(true),
    hasInternetConnection: () => xs.of(true),
  }),
  appstate: () => xs.of('active'),
  orientation: () => xs.never(),
  globalEventBus: makeEventBusDriver(),
  linking: () => xs.never(),
  dialog: (x) => ({
    alert: () => xs.never(),
    prompt: () => xs.never(),
    showPicker: () => xs.never(),
  }),
  localization: makeLocalizationDriver(),
  keyboard: (x) => ({
    events: () => xs.never(),
  }),
};

const screens = {
  [GlobalScreen]: withState(global),
  [Screens.Welcome]: withState(welcome),
  [Screens.Central]: withState(central),
  // [Screens.Drawer]: withState(drawer),
  // [Screens.DialogAbout]: dialogAbout,
  // [Screens.DialogThanks]: dialogThanks,
  [Screens.Compose]: withState(compose),
  // [Screens.ComposeAudio]: withState(composeAudio),
  [Screens.Thread]: withState(thread),
  // [Screens.Conversation]: withState(conversation),
  // [Screens.RecipientsInput]: withState(recipientsInput),
  // [Screens.Libraries]: libraries,
  // [Screens.InvitePaste]: withState(pasteInvite),
  // [Screens.InviteCreate]: withState(createInvite),
  [Screens.Profile]: withState(profile),
  // [Screens.ProfileEdit]: withState(editProfile),
  // [Screens.AliasManage]: withState(manageAliases),
  // [Screens.AliasRegister]: withState(registerAlias),
  // [Screens.Biography]: withState(biography),
  [Screens.Accounts]: withState(accounts),
  // [Screens.Backup]: withState(backup),
  [Screens.SecretOutput]: withState(secretOutput),
  [Screens.SecretInput]: withState(secretInput),
  // [Screens.RawDatabase]: rawDatabase,
  // [Screens.RawMessage]: rawMessage,
  // [Screens.Settings]: withState(settings),
};

run(screens, drivers, welcomeLayout);
