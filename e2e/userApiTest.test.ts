import { setupRequests } from "./util";

import { User } from "../src/model/User";

const defaultUser: User = {
  id: "1",
  age: 4,
  isDeleted: false,
  login: "autoSuggest",
  password: "a3aXsdq111zXX",
};

const sendRequest = setupRequests("localhost", 3000);

const createUser = (user: User) =>
  sendRequest({ path: "/users/create", method: "POST", payload: user });

const getUser = (id: string) =>
  sendRequest({ path: `/users/user/${id}`, method: "GET" });

const updateUser = (id: string, user: User) =>
  sendRequest({ path: `/users/user/${id}`, method: "PUT", payload: user });

Promise.all([
  createUser(defaultUser),
  createUser({ ...defaultUser, id: "2" }),
  createUser({ ...defaultUser, id: "3" }),
])
  .then(() => getUser(defaultUser.id))
  .then(() =>
    updateUser(defaultUser.id, { ...defaultUser, age: defaultUser.age + 20 })
  )
  .then(() => getUser(defaultUser.id))
  .then(() =>
    sendRequest({
      path: "/users/autoSuggest",
      method: "POST",
      payload: { limit: 10, loginPart: defaultUser.login.substr(0, 2) },
    })
  )
  .then(() =>
    sendRequest({ path: `/users/user/${defaultUser.id}`, method: "DELETE" })
  )
  .then(() =>
    sendRequest({ path: `/users/user/${defaultUser.id}`, method: "GET" })
  );
