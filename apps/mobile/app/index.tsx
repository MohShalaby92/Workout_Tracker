import { Redirect } from "expo-router";

export default function Index() {
  // TODO: Re-enable auth-based routing once login flow is wired up
  return <Redirect href="/(coach)/dashboard" />;
}
