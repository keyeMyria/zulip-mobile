/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, Image } from 'react-native';

import { getActiveRealmEmoji } from '../selectors';

const styles = StyleSheet.create({
  image: {
    width: 20,
    height: 20,
  },
});

type Props = {
  realmEmoji: {},
  name: string,
};

class RealmEmoji extends PureComponent<Props> {
  props: Props;

  render() {
    const { name, realmEmoji } = this.props;

    if (!realmEmoji[name]) {
      return null;
    }

    return <Image style={styles.image} source={{ uri: realmEmoji[name].source_url }} />;
  }
}

export default connect(state => ({
  realmEmoji: getActiveRealmEmoji(state),
}))(RealmEmoji);
