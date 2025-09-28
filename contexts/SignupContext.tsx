import React, { createContext, useContext, useState } from "react";

interface SignupData {
  email: string;
  name: string;
  password: string;
}

interface SignupContextType {
  signupData: SignupData;
  setEmail: (email: string) => void;
  setName: (name: string) => void;
  setPassword: (password: string) => void;
  clearSignupData: () => void;
  isEmailValid: () => boolean;
  isNameValid: () => boolean;
  isPasswordValid: () => boolean;
}

const SignupContext = createContext<SignupContextType>({
  signupData: { email: "", name: "", password: "" },
  setEmail: () => {},
  setName: () => {},
  setPassword: () => {},
  clearSignupData: () => {},
  isEmailValid: () => false,
  isNameValid: () => false,
  isPasswordValid: () => false,
});

export const useSignup = () => useContext(SignupContext);

export const SignupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [signupData, setSignupData] = useState<SignupData>({
    email: "",
    name: "",
    password: "",
  });

  const setEmail = (email: string) => {
    setSignupData((prev) => ({ ...prev, email }));
  };

  const setName = (name: string) => {
    setSignupData((prev) => ({ ...prev, name }));
  };

  const setPassword = (password: string) => {
    setSignupData((prev) => ({ ...prev, password }));
  };

  const clearSignupData = () => {
    setSignupData({ email: "", name: "", password: "" });
  };

  const isEmailValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(signupData.email);
  };

  const isNameValid = () => {
    return signupData.name.trim().length >= 1;
  };

  const isPasswordValid = () => {
    return signupData.password.length >= 8;
  };

  return (
    <SignupContext.Provider
      value={{
        signupData,
        setEmail,
        setName,
        setPassword,
        clearSignupData,
        isEmailValid,
        isNameValid,
        isPasswordValid,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
};
