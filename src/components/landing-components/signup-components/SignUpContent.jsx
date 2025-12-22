import React from "react";
import signupImg from "../../../assets/images/signup.png";
import { useTranslation } from "react-i18next";

const SignUpContent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-9 basis-1/2">
      <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold lg:w-1/2">
        {t("signup.title")}
      </h1>
      <img
        src={signupImg}
        alt=""
        className="max-w-[500px] max-h-[500px] hidden md:block"
      />
      <div className="md:text-primary md:flex flex-col gap-8 text-white hidden">
        <p className="lg:text-xl text-sm font-normal lg:w-1/2">
          {t("signup.description1")}
        </p>
        <p className="text-black">{t("signup.description2")}</p>
      </div>
    </div>
  );
};

export default SignUpContent;
