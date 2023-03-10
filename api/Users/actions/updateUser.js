import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import checkIfAuthorized, { isAdmin } from './checkIfAuthorized';

let action;

const updateUserAvatarUrl = ({ _id, avatarUrl }) => {
  try {
    return Meteor.users.update(_id, {
      $set: { avatarUrl },
    });
  } catch (exception) {
    throw new Error(`[updateUser.updateUserAvatarUrl] ${exception.message}`);
  }
};

const updateUserClass = (item) => {
  try {
    return Meteor.users.update(item._id, {
      $set: { class: item.class },
    });
  } catch (exception) {
    throw new Error(`[updateUser.updateUserClass] ${exception.message}`);
  }
};

const updateUserEntities = ({ _id, entities }) => {
  try {
    return Meteor.users.update(_id, {
      $set: { entities },
    });
  } catch (exception) {
    throw new Error(`[updateUser.updateUserEntities] ${exception.message}`);
  }
};

const updateUserLocations = ({ _id, locations }) => {
  try {
    return Meteor.users.update(_id, {
      $set: { locations },
    });
  } catch (exception) {
    throw new Error(`[updateUser.updateUserLocations] ${exception.message}`);
  }
};

const updateUserSettings = ({ _id, settings }) => {
  try {
    return Meteor.users.update(_id, {
      $set: { settings },
    });
  } catch (exception) {
    throw new Error(`[updateUser.updateUserSettings] ${exception.message}`);
  }
};

const updateUserProfile = ({ _id, profile }) => {
  try {
    return Meteor.users.update(_id, {
      $set: { profile },
    });
  } catch (exception) {
    throw new Error(`[updateUser.updateUserProfile] ${exception.message}`);
  }
};

const updateUserEmail = ({ _id, email }) => {
  try {
    return Meteor.users.update(_id, {
      $set: {
        'emails.0.address': email,
      },
    });
  } catch (exception) {
    throw new Error(`[updateUser.updateUserEmail] ${exception.message}`);
  }
};

const updateUserRoles = ({ _id, roles }) => {
  try {
    return Roles.setUserRoles(_id, roles);
  } catch (exception) {
    throw new Error(`[updateUser.updateUserRoles] ${exception.message}`);
  }
};

const updateUserPassword = ({ _id, password }) => {
  try {
    return Accounts.setPassword(_id, password);
  } catch (exception) {
    throw new Error(`[updateUser.updateUserPassword] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.currentUser) throw new Error('options.currentUser is required.');
    if (!options.user) throw new Error('options.user is required.');
  } catch (exception) {
    throw new Error(`[updateUser.validateOptions] ${exception.message}`);
  }
};

const updateUser = (options) => {
  try {
    validateOptions(options);
    checkIfAuthorized({
      as: ['admin', () => !options.user._id],
      userId: options.currentUser._id,
      errorMessage: 'Sorry, you need to be an admin or the passed user to do this.',
    });

    const userToUpdate = options.user;

    if (userToUpdate && !userToUpdate._id) {
      // NOTE: If passed user doesn't have an _id, we know we're updating the
      // currently logged in user (i.e., via the /profile page).
      userToUpdate._id = options.currentUser._id;
    }

    if (userToUpdate.password) updateUserPassword(userToUpdate);
    if (userToUpdate.roles && isAdmin(options.currentUser._id)) updateUserRoles(userToUpdate);
    if (userToUpdate.email) updateUserEmail(userToUpdate);
    if (userToUpdate.profile) updateUserProfile(userToUpdate);
    if (userToUpdate.avatarUrl) updateUserAvatarUrl(userToUpdate);
    if (userToUpdate.settings) updateUserSettings(userToUpdate);
    if (userToUpdate.entities) updateUserEntities(userToUpdate);
    if (userToUpdate.locations) updateUserLocations(userToUpdate);
    if (userToUpdate.class) updateUserClass(userToUpdate);
    
    action.resolve();
  } catch (exception) {
    action.reject(`[updateUser] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    action = { resolve, reject };
    updateUser(options);
  });
