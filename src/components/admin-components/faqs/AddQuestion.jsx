"use client";
import React from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { useCreateQuestionMutation } from "@/redux/api/faqsApi"; // مسار الاستيراد حسب مشروعك
import { useGetQuestionsQuery } from "../../../redux/api/faqsApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const AddQuestion = () => {
  const { t } = useTranslation();

  const [createQuestion, { isLoading }] = useCreateQuestionMutation();
  const { refetch } = useGetQuestionsQuery();

  const initialValues = {
    questions: [
      { questionString: "", answer: "" }, // أول سؤال
    ],
  };

  const validationSchema = Yup.object({
    questions: Yup.array().of(
      Yup.object().shape({
        questionString: Yup.string().required(
          t("question.validation.questionRequired")
        ),
        answer: Yup.string().required(t("question.validation.answerRequired")),
      })
    ),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      await createQuestion(values).unwrap();
      toast.success(t("question.successMessage"));
      refetch();
      resetForm();
    } catch (err) {
      toast.error(
        err?.data?.message || t("question.errorMessage") || "حدث خطأ أثناء إضافة السؤال"
      );
    }
  };

  return (
    <div className=" mx-auto p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{t("question.faqTitle")}</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched }) => (
          <Form>
            <FieldArray name="questions">
              {({ push, remove }) => (
                <>
                  {values.questions.map((q, index) => (
                    <div
                      key={index}
                      className="mb-4 border p-3 rounded-lg relative"
                    >
                      <label className="block text-gray-700 mb-1">
                        {t("question.questionLabel")}
                      </label>
                      <Field
                        name={`questions[${index}].questionString`}
                        placeholder={t("question.questionPlaceholder")}
                        className="w-full border  rounded p-2 mb-2 bg-primary/10 focus:outline-primary"
                      />
                      {touched.questions &&
                        touched.questions[index] &&
                        errors.questions &&
                        errors.questions[index]?.questionString && (
                          <div className="text-red-500 text-sm mb-2">
                            {errors.questions[index].questionString}
                          </div>
                        )}

                      <label className="block text-gray-700 mb-1">
                        {t("question.answerLabel")}
                      </label>
                      <Field
                        as="textarea"
                        name={`questions[${index}].answer`}
                        placeholder={t("question.answerPlaceholder")}
                        className="w-full border  rounded p-2 bg-primary/10 focus:outline-primary"
                        rows="3"
                      />
                      {touched.questions &&
                        touched.questions[index] &&
                        errors.questions &&
                        errors.questions[index]?.answer && (
                          <div className="text-red-500 text-sm">
                            {errors.questions[index].answer}
                          </div>
                        )}

                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-2 left-2 text-[#D50B3E] border border-[#FBB1C4] text-sm bg-[#FEF0F4] px-3 py-1 rounded-lg"
                        >
                          {t("question.deleteButton")}
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => push({ questionString: "", answer: "" })}
                    className="bg-gray-200 px-3 py-1 rounded mb-4 mx-5"
                  >
                    + {t("question.addQuestionButton")}
                  </button>
                </>
              )}
            </FieldArray>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white px-3 py-1 rounded"
            >
              {isLoading ? t("question.submitting") : t("question.saveButton")}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddQuestion;
