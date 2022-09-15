import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Monmarche from "../assets/logo/Monmarche.png";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton"; 
import { actionLogin } from "../redux/actions/actionAuth";
import { useDispatch } from "react-redux";
import WaitScreen from "./WaitScreen";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

const SignIn = ({navigation}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  const dispatch = useDispatch();
  const { height } = useWindowDimensions(); 

  useEffect(() => {
    if (error != null) {
      Alert.alert("ERREUR", error, [{ text: "OK" }]);
    }
  }, [error]);

  useLayoutEffect(() => {
    load();
  }, []);

  const load = async () => {
    const userDetaisStr = await AsyncStorage.getItem("userDetails");
    if (userDetaisStr !== null) {
      const userDetailsObj = JSON.parse(userDetaisStr);
      const { token, userId, dateTokenExpire } = userDetailsObj;
      const expireDate = new Date(dateTokenExpire);
      if (expireDate <= new Date() || !token || !userId) {
        console.log(userDetailsObj.useId);
        setIsAuth(true);
        navigation.navigate("Delivery");
        return;
      }
      navigation.navigate("Delivery");
      setIsAuth(true);
    } else {
      setIsAuth(true);
    }
  }
    const onSignInPressed = async () => {
      if (email.length > 0 && password.length > 0) {
        setError(null);
        try {
          await dispatch(actionLogin(email, password));
          // validate user
          navigation.navigate("Delivery");
        } catch (error) {
          setError(error.message);
        }
      } else {
        alert("Please complete all fields ");
      }
    };

    if (isAuth) {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.root}>
            {isLoading ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <Image
                source={Monmarche}
                style={[styles.logo, { height: height * 0.3 }]}
                resizeMode="contain"
              />
            )}

            <Text style={styles.title}>Login</Text>

            <CustomInput
              placeholder="Email"
              value={email}
              keyboardType="email-address"
              setValue={setEmail}
            />
            <CustomInput
              placeholder="Password"
              value={password}
              setValue={setPassword}
              secureTextEntry
            />
          </View>
          <CustomButton text="Sign In" onPress={onSignInPressed} />
        </ScrollView>
      );
    }
    return <WaitScreen />;
  };

  const styles = StyleSheet.create({
    root: {
      alignItems: "center",
      padding: 20,
    },
    logo: {
      width: "70%",
      maxWidth: 300,
      maxHeight: 200,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#051C60",
      margin: 10,
    },
  });


export default SignIn;
