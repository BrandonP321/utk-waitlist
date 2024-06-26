import React, { useEffect, useRef, useState } from "react";
import styles from "./App.module.scss";
import loc from "./loc";
import { Form, Formik, Field } from "formik";
import * as Yup from "yup";
import axios, { AxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/pro-solid-svg-icons";
import classNames from "classnames";
import bgImg from "./media/wedding-bands.jpg";
import lowResBgImg from "./media/wedding-bands-mini.jpg";

function App() {
  const bgDiv = useRef<HTMLDivElement>(null);
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const ele = bgDiv.current;
    const image = bgDiv.current?.getAttribute("data-src")!;

    const img = new Image();

    img.src = image;

    img.onload = () => {
      if (ele) {
        ele.style.backgroundImage = `url(${image})`;
        setBgLoaded(true);
      }
    };
  }, []);

  return (
    <div
      ref={bgDiv}
      className={classNames(styles.app)}
      style={{ backgroundImage: `url(${lowResBgImg})` }}
      data-src={bgImg}
    >
      <div className={classNames(styles.overlay, bgLoaded && styles.loaded)} />
      <div className={styles.content}>
        <div>
          <h1 className={styles.title}>{loc.title}</h1>

          <JoinForm />
        </div>

        <p className={styles.subtext}>{loc.subtext}</p>
      </div>
    </div>
  );
}

const FormSchema = Yup.object().shape({
  email: Yup.string().email(loc.invalidEmail).required("Required"),
});

type Values = {
  email: string;
};

function JoinForm() {
  const [customError, setCustomError] = useState<string | null>(null);
  const [isSubscribeSuccess, setIsSubscribeSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values: Values) => {
    setCustomError(null);
    setLoading(true);

    subscribeEmail(values.email)
      .then(() => setIsSubscribeSuccess(true))
      .catch((err: AxiosError) => {
        setLoading(false);
        const status = err.response?.status;

        if (status === 400) {
          setCustomError(loc.dupeEmail);
        } else {
          setCustomError(loc.internalError);
        }
      });
  };

  return (
    <Formik
      validationSchema={FormSchema}
      initialValues={{ email: "" }}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, errors }) => {
        const { email } = values;

        return (
          <Form noValidate>
            <div className={styles.waitlistForm}>
              <h2 className={styles.formTitle}>{loc.formTitle}</h2>
              <div className={styles.inputContainer}>
                <SuccessMsg show={isSubscribeSuccess} />

                <Field
                  type="email"
                  name="email"
                  formNoValidate
                  placeholder={loc.inputText}
                  className={styles.input}
                  disabled={loading}
                />
                <JoinBtn email={email} loading={loading} />
              </div>

              <div className={styles.mobileJoinBtnWrapper}>
                <JoinBtn
                  email={email}
                  loading={loading}
                  hide={isSubscribeSuccess}
                  mobile
                />
              </div>

              {(errors.email || customError) && (
                <p className={styles.error}>{errors.email || customError}</p>
              )}
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}

function JoinBtn({
  email,
  loading,
  mobile = false,
  hide = false,
}: {
  loading: boolean;
  email: string;
  mobile?: boolean;
  hide?: boolean;
}) {
  return (
    <button
      className={classNames(
        styles.joinBtn,
        loading && styles.loading,
        mobile && styles.mobile,
        hide && styles.hide
      )}
      type="submit"
      disabled={!email || loading}
    >
      {loc.joinBtn}
    </button>
  );
}

function SuccessMsg({ show }: { show: boolean }) {
  return (
    <div className={classNames(styles.successMsg, show && styles.show)}>
      <FontAwesomeIcon icon={faCircleCheck} className={styles.icon} />
      <p>{loc.subscribeSuccess}</p>
    </div>
  );
}
function subscribeEmail(email: string) {
  return axios.post(process.env.REACT_APP_SUBSCRIBE_ENDPOINT!, { email });
}

export default App;
