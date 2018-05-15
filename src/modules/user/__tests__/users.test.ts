import { request } from 'graphql-request';

import { User } from '../../../entity/User';
import { createTypeormConn } from '../../../utils/createTypeormConn';

import * as casual from 'casual';

import {
  userCreation,
  valid_email,
  valid_password,
  usersQuery,
  userQuery,
  updateUserMutation
} from '../queries/queries';

import { Connection } from 'typeorm';

let conn: Connection;

beforeAll(async () => {
 conn = await createTypeormConn();
})

afterAll(async () => {
  conn.close();
});

describe("User management", () => {
  it("Can query users", async () => {
    await request(
      process.env.TEST_HOST as string,
      userCreation(valid_email, valid_password)
    );

    const response: any = await request(
      process.env.TEST_HOST as string,
      usersQuery()
    );

    expect(response.users).toHaveLength(1);
  });

  it("Can query specific user", async () => {
    const actualUsers = await User.find({ where: { valid_email }});
    expect(actualUsers).toHaveLength(1);

    const user = actualUsers[0];
    const response: any = await request(
      process.env.TEST_HOST as string,
      userQuery(user.id)
    );

    expect(response.user.email).toEqual(valid_email);
  });

  it("Can update user", async () => {
    const actualUsers = await User.find({ where: { valid_email }});
    expect(actualUsers).toHaveLength(1);

    const user = actualUsers[0];
    const beforeResponse: any = await request(
      process.env.TEST_HOST as string,
      userQuery(user.id)
    );

    expect(beforeResponse.user.firstName).toBeNull();
    expect(beforeResponse.user.lastName).toBeNull();

    let newFirstName = casual.first_name;
    let newLastName = casual.last_name;
    const response: any = await request(
      process.env.TEST_HOST as string,
      updateUserMutation(user.id, newFirstName, newLastName)
    );

    expect(response.updateUser).toBeNull();

    const updatedResponse: any = await request(
      process.env.TEST_HOST as string,
      userQuery(user.id)
    );

    expect(updatedResponse.user.firstName).toEqual(newFirstName);
    expect(updatedResponse.user.lastName).toEqual(newLastName);
  });
});
