"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";
import type { Profile, StartupStory, User } from "@/lib/types";
import { changePassword, currentUser, signIn, signOut, signUp, updateAccount } from "@/services/accountService";

const PROFILE_KEY = "ps41.profile";
const STORY_KEY = "ps41.story";

type SessionValue = {
  ready: boolean;
  user: User | null;
  profile: Profile | null;
  story: StartupStory;
  signUp: typeof signUp;
  signIn: typeof signIn;
  signOut: () => void;
  updateAccount: typeof updateAccount;
  changePassword: typeof changePassword;
  saveProfile: (profile: Profile) => void;
  saveStory: (story: StartupStory) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

const emptyStory: StartupStory = { text: "", futureIntent: "" };

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [story, setStory] = useState<StartupStory>(emptyStory);

  useEffect(() => {
    setUser(currentUser());
    setProfile(readJson<Profile | null>(PROFILE_KEY, null));
    setStory(readJson<StartupStory>(STORY_KEY, emptyStory));
    setReady(true);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      ready,
      user,
      profile,
      story,
      signUp: async (input) => {
        const session = await signUp(input);
        setUser(session);
        return session;
      },
      signIn: async (input) => {
        const session = await signIn(input);
        setUser(session);
        return session;
      },
      signOut: () => {
        signOut();
        setUser(null);
      },
      updateAccount: async (input) => {
        const session = await updateAccount(input);
        setUser(session);
        return session;
      },
      changePassword,
      saveProfile: (next) => {
        writeJson(PROFILE_KEY, next);
        setProfile(next);
      },
      saveStory: (next) => {
        writeJson(STORY_KEY, next);
        setStory(next);
      },
    }),
    [profile, ready, story, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
