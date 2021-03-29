import { sendRequest, setupRequests } from "./util";

import { User } from "../src/model/User";

const defaultUser: User = {
  id: "1",
  age: 4,
  isDeleted: false,
  login: "autoSuggest",
  password: "a3aXsdq111zXX",
};

const { request, jsonRequest } = setupRequests("localhost", 3000);

const createUser = (user: User) =>
  jsonRequest({ path: "/users/create", method: "POST", payload: user });

const getUser = (id: string) =>
  request({ path: `/users/user/${id}`, method: "GET" });

const updateUser = (id: string, user: User) =>
  jsonRequest({ path: `/users/user/${id}`, method: "PUT", payload: user });

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
      jsonRequest({
        path: "/users/autoSuggest",
        method: "POST",
        payload: { limit: 10, loginPart: defaultUser.login.substr(0, 2) },
      })
    )
  )
  .then(() =>
    sendRequest(
      request({ path: `/users/user/${defaultUser.id}`, method: "DELETE" })
    )
  )
  .then(() =>
    sendRequest(
      request({ path: `/users/user/${defaultUser.id}`, method: "GET" })
    )
  );
