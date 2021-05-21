import React from "react";
import {
  View, Text, TouchableOpacity
} from "react-native";
import {
  NavigationContainer
} from "@react-navigation/native";
import {
  createStackNavigator
} from "@react-navigation/stack";
import {
  AsyncStorage as Ass
} from "react-native";

import Game from "./game";

const Stack = createStackNavigator();

const HomeScreen = (props) => {

  let settings;

  const openScreen = async (f) => {
    settings = await props.settings;
    f();
  };

  const openGame = async () => {
    let save = await props.load("gameState");
    props.navigation.navigate("Game",{
      state: save, settings: settings
    });
  };

  const startNew = async () => {
    props.navigation.navigate("Game",{
      settings: settings
    });
  };

  const openSettings = async () => {
    props.navigation.navigate("Settings",{
      settings: settings
    });
  };

  return(
    <View style = {{
      flex: 1,
      flexDirection: "column",
      justifyContent: "center"
    }}>
    <TouchableOpacity
    name = { "Continue" }
    onPress = { () => openScreen(openGame) }
    >
    <Text>
    Continue
    </Text>
    </TouchableOpacity>
    <TouchableOpacity
    name = { "New Game" }
    onPress = { () => openScreen(startNew) }
    >
    <Text>
    New Game
    </Text>
    </TouchableOpacity>
    <TouchableOpacity
    name = { "Settings" }
    onPress = { () => (
      openScreen(openSettings)
    )}
    >
    <Text>
    Settings
    </Text>
    </TouchableOpacity>
    </View>
  );
};

import
InputSpinner
from "react-native-input-spinner";

const Settings = (props) => {

  let settings = props.route.params.
    settings || {};

  const deleteCache = async () => {
    await Ass.multiRemove([
      "gameState","settings"
    ]);
  };

  let fov = settings.fov || 90;
  let fs = settings.fs || 6;
  let step = 1;

  React.useEffect(() => {
    return () => {
      settings.fov = fov;
      settings.fs = fs;
      props.save(settings,"settings");
    }
  });

  return(
    <View>
      <View>
        <Text> Field of view </Text>
        <InputSpinner
          max = {179} min = {1} step = {step}
          colorMax = {"black"}
          colorMin = {"black"}
          value = {fov}
          onChange = {(v) => (fov = v)}
          continuity = {true}
          editable = {true}
          onLongPress = {(v) => (step = 5)}
          onKeyPress = {(v) => (step = 1)}
        />
      </View>
      <View>
        <Text> Fire button size </Text>
        <InputSpinner
          max = {12} min = {3} step = {1}
          colorMax = {"black"}
          colorMin = {"black"}
          value = {fs} onChange = {
            (v) => (fs = v)
          }
          continuity = {true}
          editable = {true}
        />
      </View>
      <TouchableOpacity
        onPress = {deleteCache}
      >
        <Text> Delete cache </Text>
      </TouchableOpacity>
    </View>
  );
};

const App = () => {

  const save = (state, key) => {
    Ass.setItem(key, JSON.stringify(state));
  };

  const load = async (key) => {
    return JSON.parse(await Ass.getItem(key));
  };

  const settings = load("settings");

  return(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name = { "HomeScreen" }
            options = {{
              headerShown: false,
              title: "AMAZEBALL"
            }}
          >
            {(props) => (
              <HomeScreen
                {...props}
                load = {load}
                settings = {settings}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name = { "Game" }
            options ={{ headerShown: false }}
          >
            {(props) => (
              <Game {...props} save = {save}/>
            )}
          </Stack.Screen>
          <Stack.Screen
            name = { "Settings" }
            children = { (props) => (
              <Settings
                {...props}
                save = {save}
              />
            )}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
}

export default App;
