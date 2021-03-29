import { Schema } from "ajv";
import { request, ClientRequest, IncomingMessage } from "http";

import { PORT } from "./config";
import { User } from "./model/User";

import { createSchemaValidator } from "./validation/createSchemaValidator";

const defaultUser: User = {
  id: "1",
  age: 4,
  isDeleted: false,
  login: "autoSuggest",
  password: "a3aXsdq111zXX",
};

const logResponse = (res: IncomingMessage) => {
  res.setEncoding("utf8");
  res.on("data", function (chunk) {
    console.log("Response: " + chunk);
  });
};

const sendRequest = (request: ClientRequest) => {
  return new Promise((resolve, reject) => {
    request.end();
    request.on("finish", () => resolve(request)).on("error", reject);
  });
};

const makeRequest = (
  path: string,
  method: "GET" | "POST" | "DELETE" | "PUT",
  callback?: (res: IncomingMessage) => void,
  headers?: Record<string, any>
): ClientRequest =>
  request(
    {
      host: `localhost`,
      port: PORT,
      path,
      method,
      headers,
    },
    callback
  ).on("error", () => console.log("err"));

const makeJsonRequest = (
  path: string,
  method: "POST" | "DELETE" | "PUT",
  payload: Record<string, any>,
  callback?: (res: IncomingMessage) => void
): ClientRequest => {
  const data = JSON.stringify(payload);
  const request = makeRequest(path, method, callback, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  });
  request.write(data);

  return request;
};

const createUser = (user: User) => {
  return makeJsonRequest("/users/create", "POST", user, logResponse);
};

const getUser = (id: string) => {
  return makeRequest(`/users/user/${id}`, "GET", logResponse);
};

const updateUser = (id: string, user: User) => {
  return makeJsonRequest(`/users/user/${id}`, "PUT", user, logResponse);
};

Promise.all(
  [
    createUser(defaultUser),
    createUser({ ...defaultUser, id: "2" }),
    createUser({ ...defaultUser, id: "3" }),
  ].map(sendRequest)
)
  .then(() => sendRequest(getUser(defaultUser.id)))
  .then(() =>
    sendRequest(
      updateUser(defaultUser.id, { ...defaultUser, age: defaultUser.age + 20 })
    )
  )
  .then(() => sendRequest(getUser(defaultUser.id)))
  .then(() =>
    sendRequest(
      makeJsonRequest(
        "/users/autoSuggest",
        "POST",
        { limit: 10, loginPart: defaultUser.login.substr(0, 2) },
        logResponse
      )
    )
  )
  .then(() =>
    sendRequest(
      makeRequest(`/users/user/${defaultUser.id}`, "DELETE", logResponse)
    )
  )
  .then(() =>
    sendRequest(
      makeRequest(`/users/user/${defaultUser.id}`, "GET", logResponse)
    )
  );

// const schema: Schema = {
//   type: "object",
//   properties: {
//     id: { type: "string", pattern: "^(?!\s*$).+" },
//     login: { type: "string", pattern: "^(?!\s*$).+" },
//     password: { type: "string", pattern: "^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$" },
//     age: { type: "integer", minimum: 3, maximum: 120 },
//     isDeleted: { type: "boolean" },
//   },
//   required: ["password"],
// };

// console.log(createSchemaValidator(schema)({password: "3aXsdq111zXX" }));
