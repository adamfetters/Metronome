const mongoose = require('mongoose');
const User = require('../server/models/User');
const { UserDataFactory } = require('./testDataFactories');

const {
  validNewUser,
  newUserWithBadEmail,
  newUserWithBadPassword,
  newUserWithBadFirstName,
  newUserWithBadLastName,
} = UserDataFactory;

describe('User model', () => {
  beforeAll((done) => {
    mongoose.connect('mongodb://localhost/Metronome_local_test');
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', done);
  });

  afterAll((done) => {
    mongoose.connection.db.dropCollection('users', done);
  });

  it('Should not register a user with an invalid email', async () => {
    try {
      await User.registerNewUser(newUserWithBadEmail);
    } catch (err) {
      expect(err.message).toBe('Email must be a valid email.');
    }
  });

  it('Should not register a user with an invalid password', async () => {
    try {
      await User.registerNewUser(newUserWithBadPassword);
    } catch (err) {
      expect(err.message).toBe('Password must be between 8 and 56 characters.');
    }
  });

  it('Should not register a user with an invalid first name', async () => {
    try {
      await User.registerNewUser(newUserWithBadFirstName);
    } catch (err) {
      expect(err.message).toBe('First name must be between 1 and 100 characters.');
    }
  });

  it('Should not register a user with an invalid last name', async () => {
    try {
      await User.registerNewUser(newUserWithBadLastName);
    } catch (err) {
      expect(err.message).toBe('Last name must be between 1 and 100 characters.');
    }
  });

  // New student is in the test database after this test
  it('Should register a valid user and hash the password correctly', async () => {
    const user = await User.registerNewUser(validNewUser);
    const userInDb = await User.findOne({ email: user.email });
    expect(user.email).toEqual(userInDb.email);
    expect(userInDb.comparePassword(validNewUser.password)).toBeTruthy();
  });

  it('Should validate incorrect passwords properly', async () => {
    const user = await User.findOne({ email: validNewUser.email });
    expect(user.comparePassword('wrongpassword')).toBeFalsy();
  });

  it('Should not edit the user\'s profile if new information is invalid', async () => {
    const newData = { ...newUserWithBadEmail };
    delete newData.password;
    try {
      const user = await User.findOne({ email: validNewUser.email });
      await user.editProfile(newData);
    } catch (err) {
      expect(err.message).toBe('Email must be a valid email.');
    }
  });

  it('Should not edit the user\'s password if the old password is incorrect', async () => {
    const newData = { ...validNewUser, oldPassword: 'abcdefghijklmnop', newPassword: 'qrstuvwxyz' };
    delete newData.password;
    try {
      const user = await User.findOne({ email: validNewUser.email });
      await user.editProfile(newData);
    } catch (err) {
      expect(err.message).toBe('Password is not correct.');
    }
  });

  it('Should edit the user\'s profile if new information is valid', async () => {
    const newData = {
      email: 'mynewemail@example.com',
      oldPassword: validNewUser.password,
      newPassword: 'mynewpassword',
      firstName: 'NewFirstName',
      lastName: 'NewLastName',
    };
    const user = await User.findOne({ email: validNewUser.email });
    await user.editProfile(newData);
    expect(user.email).toBe(newData.email);
    expect(user.comparePassword(newData.newPassword)).toBeTruthy();
    expect(user.firstName).toBe(newData.firstName);
    expect(user.lastName).toBe(newData.lastName);
  });
});