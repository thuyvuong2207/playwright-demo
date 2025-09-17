export const LOGIN_UI = {
    txtEmail: "input[name='email']",
    txtPassword: "input[type='password']",
    btnLogin: "button[type='submit']",
    btnForgotPassword: "//p[text()='Forgot Password']",
    msgIncorrectEmailOrPassword:
        "//p[contains(text(), 'Email/Password is incorrect')]",
    msgEmailMustNotBeEmpty: "//p[contains(text(), 'Email must not be empty.')]",
    msgPasswordMustNotBeEmpty:
        "//p[contains(text(), 'Password must not be empty.')]",
};
export default LOGIN_UI;
