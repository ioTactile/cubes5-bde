import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";

export {Timestamp};

export type Image = {
  name: string
  ref: string
  url: string
}

export const userConverter = {
  toFirestore: (user: User): DocumentData => user,
  fromFirestore(snapshot: QueryDocumentSnapshot<User>): User {
    return snapshot.data();
  },
};

export type User = {
    id: string
    email: string
    creationDate: Timestamp
    updateDate: Timestamp
    role?: {admin: true}
    firstName?: string
    lastName?: string
    basket?: Record<string, number>
    wishList?: string[]
  }

export const productConverter = {
  toFirestore: (product: Product): DocumentData => product,
  fromFirestore(snapshot: QueryDocumentSnapshot<Product>): Product {
    return snapshot.data();
  },
};

export type Product = {
    id: string
    name: string
    description: string
    price: number
    quantity: number
    image: Image
    category: string
    slug: string
    soldNb: number
    wishListNb: number
    creationDate: Timestamp
    updateDate: Timestamp
  }
