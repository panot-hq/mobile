import AuthButton from "@/components/auth/Button";
import { useAuth } from "@/contexts/AuthContext";
import { StyleSheet, Text, View } from "react-native";

export default function TabOneScreen() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={[styles.separator, { backgroundColor: "#fff" }]} />
      <AuthButton
        title="Sign Out"
        onPress={handleSignOut}
        variant="secondary"
        width={150}
        height={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
