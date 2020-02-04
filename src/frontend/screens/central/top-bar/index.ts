/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {h} from '@cycle/react';
import {StateSource} from '@cycle/state';
import {ReactElement} from 'react';
import {Text, StyleSheet, Platform, Animated} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import HeaderMenuButton from '../../../components/HeaderMenuButton';
import {Typography} from '../../../global-styles/typography';

export type State = {
  currentTab: 'public' | 'private' | 'connections';
  scrollHeaderBy: Animated.Value;
};

export type Sources = {
  screen: ReactSource;
  state: StateSource<State>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  menuPress: Stream<any>;
};

export const styles = StyleSheet.create({
  container: {
    zIndex: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Dimensions.toolbarHeight,
    paddingTop: getStatusBarHeight(true),
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundBrand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  title: {
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontSize: Typography.fontSizeLarge,
    fontWeight: 'bold',
    ...Platform.select({
      ios: {
        position: 'absolute',
        top: getStatusBarHeight() + Dimensions.verticalSpaceIOSTitle,
        left: 40,
        right: 40,
        textAlign: 'center',
        marginLeft: 0,
      },
      default: {
        marginLeft: Dimensions.horizontalSpaceLarge,
      },
    }),
  },
});

function intent(reactSource: ReactSource) {
  return {
    menu$: reactSource.select('menuButton').events('press'),
  };
}

function tabTitle(tab: State['currentTab']) {
  if (tab === 'public') {
    return Platform.OS === 'ios' ? 'Manyverse' : 'Public board';
  }
  if (tab === 'private') return 'Private messages';
  if (tab === 'connections') return 'Connections';
  return '';
}

function view(state$: Stream<State>) {
  const fixAtTop = new Animated.Value(0);
  let hideWhenScrolling: Animated.AnimatedMultiplication | null = null;

  return state$.map(state => {
    // Avoid re-instantiating a new animated value on every stream emission
    if (!hideWhenScrolling) {
      hideWhenScrolling = Animated.multiply(
        Animated.diffClamp(state.scrollHeaderBy, 0, Dimensions.toolbarHeight),
        -1,
      );
    }

    const translateY =
      Platform.OS === 'android' && state.currentTab === 'public'
        ? hideWhenScrolling
        : fixAtTop;

    return h(
      Animated.View,
      {style: [styles.container, {transform: [{translateY}]}]},
      [
        HeaderMenuButton('menuButton'),
        h(Text, {style: styles.title}, tabTitle(state.currentTab)),
      ],
    );
  });
}

export function topBar(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.state.stream);

  return {
    screen: vdom$,
    menuPress: actions.menu$,
  };
}
