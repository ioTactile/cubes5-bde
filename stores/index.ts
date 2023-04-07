import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp as FirestoreTimestamp
} from '@firebase/firestore'
import { Timestamp, User, Product, Order } from '~/functions/src/types'

type NestedTypeMapper<T, I, O> = T extends I
  ? O
  : {
      [Property in keyof T]: T[Property] extends
        | Date
        | FirestoreTimestamp
        | Timestamp
        ? T[Property] extends I
          ? O
          : T[Property]
        : NestedTypeMapper<T[Property], I, O>
    }

type DatabaseUserType = NestedTypeMapper<User, Timestamp, FirestoreTimestamp>
export type LocalUserType = NestedTypeMapper<User, Timestamp, Date>
export const userConverter: FirestoreDataConverter<LocalUserType> = {
  toFirestore: item => item,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DatabaseUserType>,
    options
  ) => {
    const data = snapshot.data(options)
    return {
      ...data,
      id: snapshot.id,
      creationDate: data.creationDate.toDate(),
      updateDate: data.updateDate.toDate()
    }
  }
}

type DatabaseProductType = NestedTypeMapper<
  Product,
  Timestamp,
  FirestoreTimestamp
>
export type LocalProductType = NestedTypeMapper<Product, Timestamp, Date>
export const productConverter: FirestoreDataConverter<LocalProductType> = {
  toFirestore: item => item,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DatabaseProductType>,
    options
  ) => {
    const data = snapshot.data(options)
    return {
      ...data,
      id: snapshot.id,
      creationDate: data.creationDate.toDate(),
      updateDate: data.updateDate.toDate()
    }
  }
}

type DatabaseOrderType = NestedTypeMapper<
  Order,
  Timestamp,
  FirestoreTimestamp
>
export type LocalOrderType = NestedTypeMapper<Order, Timestamp, Date>
export const orderConverter: FirestoreDataConverter<LocalOrderType> = {
  toFirestore: item => item,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DatabaseOrderType>,
    options
  ) => {
    const data = snapshot.data(options)
    return {
      ...data,
      id: snapshot.id,
      creationDate: data.creationDate.toDate(),
      updateDate: data.updateDate.toDate()
    }
  }
}