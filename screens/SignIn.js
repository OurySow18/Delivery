/**
 * Abgabe Bachelorarbeit
 * Author: Amadou Oury Sow
 * Date: 15.09.2022
 *
 * Statseite, der User darf nicht ohne eine Erfolgreiche Anmeldung
 */
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
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const SignIn = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
 
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (error != null) {
      Alert.alert("ERREUR", error, [{ text: "OK" }]);
    }
  }, [error]);

  useEffect(() => { 
    var user = getAuth().currentUser;
    if (user) {
      setIsAuth(true);
      navigation.replace("Delivery", { userUid: user.uid });
      return;
    }
  }, []);

  //ruft die Userdaten von Firebase
  const load = async () => {
  };

  const onSignInPressed = async () => {
    if (email.length > 0 && password.length > 0) {
      setError(null);
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          if (user) {
            navigation.replace("Delivery", { userUid: user.uid }); 
          } else {
            Alert.alert(
              "Info",
              "Veuillez confirmer votre e-mail avant de pouvoir vous connecter, vous avez dejä recu un mail de confirmation. Contacter nos services si vous avez besoin d´aide"
            ); 
          }
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode);
          console.log(errorMessage);
          if (errorCode === "auth/invalid-login-credentials") {
            Alert.alert(
              "ERREUR",
              "Ce Compte n´existe pas, veuillez vous enregistrer"
            );
          }
          if (errorCode === "auth/missing-email") {
            Alert.alert("ERREUR", "Vous devez renseigner un Email valide");
          }
          if (errorCode === "auth/invalid-email") {
            Alert.alert(
              "ERREUR",
              "Email non valide. Vous devez renseigner un Email valide"
            );
          }
          if (errorCode === "auth/user-not-found") {
            Alert.alert(
              "ERREUR",
              "Cet Email n´a pas de compte. Veuiller renseigner un Email valide ou creer un nouveau compte"
            );
          }
          if (errorCode === "auth/wrong-password") {
            Alert.alert(
              "ERREUR",
              "Mauvais mot de passe, si vous avez oubliez votre mot de passe, vous pouvez le reinitialiser"
            );
          }
        });
    } else {
      Alert.alert("ERREUR", "Remplissez tous les champs, s'il vous plaît ");
    }
  };

  console.log(isAuth)

  if (!isAuth) {
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
