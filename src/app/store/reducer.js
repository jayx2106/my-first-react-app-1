import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import * as mutations from "./mutations";

let defaultState = {
  session: {},
  clients: [],
  users: [],
  myfavorites: [],
  personalnotes: [],
  locations: [],
  clientContactDetailsSuggestions: [],
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "session",
    "clients",
    "users",
    "myfavorites",
    "personalnotes",
    "locations",
    "clientContactDetailsSuggestions",
  ],
};

const rootReducer = combineReducers({
  session(userSession = defaultState.session, action) {
    let { type, authenticated, session } = action;

    switch (type) {
      case mutations.SET_STATE:
        let {
          id,
          firstName,
          lastName,
          location,
          officePhoneNumber,
          cellPhoneNumber,
          email,
          username,
        } = action.state.session;
        let isAdmin = id === "User1" ? true : false;
        return {
          ...userSession,
          id,
          firstName,
          lastName,
          location,
          officePhoneNumber,
          cellPhoneNumber,
          email,
          username,
          isAdmin,
        };
      case mutations.REQUEST_AUTHENTICATE_USER:
        return { ...userSession, authenticated: mutations.AUTHENTICATING };
      case mutations.PROCESSING_AUTHENTICATE_USER:
        return { ...userSession, authenticated };
      case mutations.UPDATE_MY_DETAILS:
        return {
          ...userSession,
          firstName: action.userdata.firstName,
          lastName: action.userdata.lastName,
          location: action.userdata.location,
          officePhoneNumber: action.userdata.officePhoneNumber,
          cellPhoneNumber: action.userdata.cellPhoneNumber,
          email: action.userdata.email,
          username: action.userdata.username,
        };

      case mutations.FETCH_CLIENT_SUGGESTIONS_PENDING:
        return {
          ...userSession,
          pending: true,
        };
      case mutations.FETCH_CLIENT_SUGGESTIONS_SUCCESS:
        return {
          ...userSession,
          pending: false,
          clientSuggestions: action.clientSuggestions,
        };
      case mutations.FETCH_CLIENT_SUGGESTIONS_ERROR:
        return {
          ...userSession,
          pending: false,
          error: action.error,
        };
      case mutations.LOGOUT_USER:
        return {};
      default:
        return userSession;
    }
  },

  clients(clients = defaultState.clients, action) {
    switch (action.type) {
      case mutations.SET_STATE:
        return action.state.clients.map((client) => {
          return {
            ...client,
            personalnotes: action.state.personalnotes.filter((note) => {
              return note.client === client.id;
            }),
            isFavorite: action.state.myfavorites.some((myfave) => {
              return myfave.client === client.id ? true : false;
            }),
            myfave: action.state.myfavorites.find((myfave) => {
              return myfave.client === client.id ? myfave : null;
            }),
          };
        });
      case mutations.SET_CLIENT_NAME:
        return clients.map((client) => {
          return client.id === action.id
            ? { ...client, name: action.name }
            : client;
        });
      case mutations.UPDATE_CLIENT:
        let {
          id,
          name,
          email,
          website,
          postNominalLetters,
          nameOfOrg,
          titleWithOrg,
          licenseNumber,
          licenseExpiryDate,
          licenseLastVerifiedDate,
          typeOfOrg,
          populationsServed,
          typesOfServices,
          specialties,
          groupsOffered,
          insuranceAccepted,
          assignedLocations,
          users,
          notes,
        } = action.client;
        return clients.map((client) => {
          return client.id === id
            ? {
                ...client,
                name,
                email,
                website,
                postNominalLetters,
                nameOfOrg,
                titleWithOrg,
                licenseNumber,
                licenseExpiryDate,
                licenseLastVerifiedDate,
                typeOfOrg,
                populationsServed,
                typesOfServices,
                specialties,
                groupsOffered,
                insuranceAccepted,
                assignedLocations,
                users,
                notes,
              }
            : client;
        });
      case mutations.CREATE_NEW_CLIENT:
        if (mutations.USER_ACCOUNT_CREATED) {
          return [
            ...clients,
            {
              ...action.client,
              clientContactDetails: [action.clientContact],
              clientContactDetailsSuggestions: [],
            },
          ];
        }
      case mutations.CREATE_CLIENT_CONTACT_DETAILS:
        return clients.map(function (client) {
          return action.clientContact.client === client.id
            ? {
                ...client,
                clientContactDetails: [
                  ...client.clientContactDetails,
                  { ...action.clientContact },
                ],
              }
            : client;
        });
      case mutations.DELETE_CLIENT:
        return (clients = clients.filter((client) => {
          return client.id !== action.id;
        }));
      case mutations.ADD_TO_MY_FAVORITES:
        //add isFavorite, myfave object to each client
        return clients.map(function (client) {
          return action.clientID === client.id
            ? {
                ...client,
                isFavorite: true,
                myfave: {
                  client: action.clientID,
                  id: action.id,
                  owner: action.owner,
                },
              }
            : client;
        });
      case mutations.REMOVE_FROM_MY_FAVORITES:
        //add isFavorite, myfave object to each client
        return clients.map(function (client) {
          if (client.myfave) {
            return action.id === client.myfave.id
              ? {
                  ...client,
                  isFavorite: false,
                  myfave: null,
                }
              : client;
          }
          return client;
        });
      case mutations.CLIENT_CONTACT_TOGGLE_EDIT:
        return clients.map(function (client) {
          return action.clientID === client.id
            ? {
                ...client,
                clientContactDetails: client.clientContactDetails.map(
                  (contact) => {
                    return contact.id === action.clientContactDetails.id
                      ? {
                          ...contact,
                          toggleEdit: action.toggleEdit,
                        }
                      : contact;
                  }
                ),
              }
            : client;
        });
      case mutations.UPDATE_CLIENT_CONTACT_DETAILS: {
        return clients.map((client) => {
          return client.id === action.clientContact.client
            ? {
                ...client,
                clientContactDetails: client.clientContactDetails.map(
                  (contact) => {
                    return contact.id === action.clientContact.id
                      ? {
                          ...contact,
                          address1: action.clientContact.address1,
                          address2: action.clientContact.address2,
                          workEmail: action.clientContact.workEmail,
                          alternateEmail: action.clientContact.alternateEmail,
                          city: action.clientContact.city,
                          state: action.clientContact.state,
                          zip: action.clientContact.zip,
                          officePhoneNumber:
                            action.clientContact.officePhoneNumber,
                          officePhoneNumberExt:
                            action.clientContact.officePhoneNumberExt,
                          cellPhoneNumber: action.clientContact.cellPhoneNumber,
                          alternativePhoneNumber:
                            action.clientContact.alternativePhoneNumber,
                          faxNumber: action.clientContact.faxNumber,
                          toggleEdit: false,
                        }
                      : contact;
                  }
                ),
              }
            : client;
        });
      }
      case mutations.DELETE_CLIENT_CONTACT_DETAILS: {
        return clients.map((client) => {
          return client.id === action.client
            ? {
                ...client,
                clientContactDetails: client.clientContactDetails.filter(
                  (contact) => {
                    return contact.id !== action.id;
                  }
                ),
              }
            : client;
        });
      }
      case mutations.SUGGEST_EDITS_TO_CLIENT_CONTACT_DETAILS:
        return clients.map(function (client) {
          return action.clientContactDetailsSuggestions.client === client.id
            ? {
                ...client,
                clientContactDetailsSuggestions: [
                  ...client.clientContactDetailsSuggestions,
                  { ...action.clientContactDetailsSuggestions },
                ],
              }
            : client;
        });
      case mutations.APPROVE_ADDRESS_SUGGESTION: {
        return clients.map(function (client) {
          return action.clientContactDetailsSuggestions.client === client.id
            ? {
                ...client,
                clientContactDetails: [
                  ...client.clientContactDetails,
                  {
                    ...action.clientContactDetailsSuggestions,
                    id: action.clientContactDetailsSuggestions.newID,
                  },
                ],
                clientContactDetailsSuggestions: client.clientContactDetailsSuggestions.filter(
                  (suggest) => {
                    return (
                      action.clientContactDetailsSuggestions.id !== suggest.id
                    );
                  }
                ),
              }
            : client;
        });
      }
      case mutations.REJECT_ADDRESS_SUGGESTION: {
        return clients.map(function (client) {
          return action.clientID === client.id
            ? {
                ...client,
                clientContactDetailsSuggestions: client.clientContactDetailsSuggestions.filter(
                  (suggest) => {
                    return action.id !== suggest.id;
                  }
                ),
              }
            : client;
        });
      }
      case mutations.LOGOUT_USER:
        return [];
    }
    return clients;
  },

  users(users = defaultState.users, action) {
    switch (action.type) {
      case mutations.SET_STATE:
        return action.state.users;
      case mutations.CREATE_USER_ACCOUNT:
        let {
          id,
          firstName,
          lastName,
          location,
          officePhoneNumber,
          cellPhoneNumber,
          email,
          username,
        } = action.userdata;
        return [
          ...users,
          {
            id,
            firstName,
            lastName,
            location,
            officePhoneNumber,
            cellPhoneNumber,
            email,
            username,
          },
        ];
      case mutations.DELETE_USER_ACCOUNT:
        return (users = users.filter((user) => {
          return user.id !== action.id;
        }));
      case mutations.UPDATE_USER_ACCOUNT:
        return users.map((user) => {
          return user.id === action.userdata.id
            ? {
                ...user,
                firstName: action.userdata.firstName,
                lastName: action.userdata.lastName,
                location: action.userdata.location,
                officePhoneNumber: action.userdata.officePhoneNumber,
                cellPhoneNumber: action.userdata.cellPhoneNumber,
                email: action.userdata.email,
                username: action.userdata.username,
              }
            : user;
        });
      case mutations.LOGOUT_USER:
        return [];
    }
    return users;
  },

  myfavorites(myfavorites = defaultState.myfavorites, action) {
    switch (action.type) {
      case mutations.SET_STATE:
        return action.state.myfavorites;
      case mutations.ADD_TO_MY_FAVORITES:
        let { clientID, id, owner } = action;
        return [
          ...myfavorites,
          {
            client: clientID,
            id,
            owner,
          },
        ];
      case mutations.REMOVE_FROM_MY_FAVORITES:
        return myfavorites.filter((myfave) => {
          return myfave.id !== action.id;
        });
      case mutations.LOGOUT_USER:
        return [];
    }
    return myfavorites;
  },

  personalnotes(personalnotes = defaultState.personalnotes, action) {
    switch (action.type) {
      case mutations.SET_STATE:
        return action.state.personalnotes;

      case mutations.TOGGLE_EDIT:
        return personalnotes.map((note) => {
          return note.id === action.id
            ? {
                ...note,
                toggleEdit: action.toggleEdit,
              }
            : note;
        });
      case mutations.SAVE_PERSONAL_NOTE:
        return [
          ...personalnotes,
          {
            id: action.id,
            client: action.client,
            note: action.note,
            datetime: action.datetime,
            owner: action.owner,
            // isVerified: action.isVerified,
          },
        ];
      case mutations.EDIT_PERSONAL_NOTE:
        let { id, note, datetimeupdated } = action.personalnote;
        return personalnotes.map((pnote) => {
          return pnote.id === id
            ? {
                ...pnote,
                // isVerified,
                note,
                datetimeupdated,
                toggleEdit: false,
              }
            : pnote;
        });
      case mutations.DELETE_PERSONAL_NOTE:
        return (personalnotes = personalnotes.filter((note) => {
          return note.id !== action.id;
        }));
      case mutations.LOGOUT_USER:
        return [];
    }
    return personalnotes;
  },
  //   clientContactDetails(clientContactDetails = {}, action) {
  //     switch (action.type) {
  //       case mutations.CLIENT_CONTACT_TOGGLE_EDIT:
  //         return action.clientContactDetails;
  //     }
  //     return clientContactDetails;
  //   },
  locations(locations = defaultState.locations, action) {
    switch (action.type) {
      case mutations.SET_STATE:
        return action.state.locations;
    }
    return locations;
  },
  clientContactDetailsSuggestions(
    clientContactDetailsSuggestions = defaultState.clientContactDetailsSuggestions,
    action
  ) {
    switch (action.type) {
      case mutations.SET_STATE:
        return action.state.clientContactDetailsSuggestions;
      case mutations.SUGGEST_EDITS_TO_CLIENT_CONTACT_DETAILS:
        return [
          ...clientContactDetailsSuggestions,
          {
            ...action.clientContactDetailsSuggestions,
          },
        ];
      case mutations.APPROVE_ADDRESS_SUGGESTION:
        return (clientContactDetailsSuggestions = clientContactDetailsSuggestions.filter(
          (suggest) => {
            return action.clientContactDetailsSuggestions.id !== suggest.id;
          }
        ));
      case mutations.REJECT_ADDRESS_SUGGESTION:
        return (clientContactDetailsSuggestions = clientContactDetailsSuggestions.filter(
          (suggest) => {
            return action.id !== suggest.id;
          }
        ));
    }
    return clientContactDetailsSuggestions;
  },
});

//export const reducer =
export default persistReducer(persistConfig, rootReducer);
