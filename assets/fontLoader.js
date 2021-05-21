import AssetUtils from 'expo-asset-utils';
import { Platform } from 'react-native';
import {
  Font, FileLoader, FontLoader as F
} from 'three';

export default class FontLoader extends F {
  load(asset, onLoad, onProgress, onError) {
    if (!asset) {
      throw new Error(
        "FontLoader.load(): " +
        "Cannot parse a null asset"
      );
    }

    let scope = this;
    let font;
    const loader = new FileLoader(
      this.manager
    );
    loader.setCrossOrigin(
      this.crossOrigin
    );
    loader.setPath(this.path);
    loader.load(
      asset, (text) => {
        let json = JSON.parse(text);
        font = scope.parse(json);

        if(onLoad) onLoad(font);
      }, onProgress, onError
    );

    return font;
  }
}
