import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";

export {Timestamp};

export const userConverter = {
  toFirestore: (user: User): DocumentData => user,
  fromFirestore(snapshot: QueryDocumentSnapshot<User>): User {
    return snapshot.data();
  },
};

export type User = {
    id: string
    email: string
    admin: boolean
    creationDate: Timestamp
    updateDate: Timestamp
    firstName?: string
    lastName?: string
    basket?: Record<string, number>
    wishList?: string[]
  }
