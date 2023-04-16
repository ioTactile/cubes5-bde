<template>
  <v-container>
    <div>
      <v-btn color="buttonBack" @click="dialog = true">
        Créer un admin
      </v-btn>
    </div>

    <v-table class="mt-4" :height="users.length > 13 ? '60vh' : ''">
      <thead>
        <tr>
          <th>E-mail</th>
          <th>Role</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.email }}</td>
          <td>{{ getRole(user.role) }}</td>
          <td class="text-right">
            <v-btn
              icon="mdi-delete"
              :disabled="removing !== null"
              :loading="removing === user.id"
              color="error"
              variant="text"
              @click="removeUser(user.id)"
            />
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="dialog" width="450" :persistent="loading">
      <v-card>
        <v-form ref="form" @submit.prevent="createUser">
          <v-card-title class="d-flex align-center">
            Création d'un nouvel admin
            <v-spacer />
            <v-btn
              icon="mdi-close"
              variant="text"
              :disabled="loading"
              @click="dialog = false"
            />
          </v-card-title>
          <v-card-text>
            <InputsEmail v-model="email" variant="outlined" icon />
            <InputsPasswordFirst
              v-model="password"
              variant="outlined"
              not-in-line
            />
            <v-checkbox
              v-model="role"
              label="Ajouter comme admin"
              value="admin"
              hide-details
            />
          </v-card-text>
          <v-card-actions justify="end" class="mr-2">
            <v-btn variant="text" :disabled="loading" @click="dialog = false">
              Annuler
            </v-btn>
            <v-btn
              color="buttonBack"
              variant="outlined"
              :loading="loading"
              type="submit"
            >
              Ajouter
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" async setup>
import { VForm } from 'vuetify/components'
import { collection, getDocs } from 'firebase/firestore'
import { useFirebaseFunctions } from '~/composables/useFirebaseFunctions'
import { userConverter, LocalUserType } from '~/stores'

definePageMeta({ layout: 'admin' })

const db = useFirestore()
const functions = useFirebaseFunctions()
const dialog = ref(false)
const email = ref<string>()
const password = ref<string>()
const role = ref<'admin' | null>(null)
const loading = ref(false)
const removing = ref<string | null>(null)
const form = ref<VForm>()
const usersRef = collection(db, 'users').withConverter(userConverter)
const usersDocs = await getDocs(usersRef)
const users = ref(usersDocs.docs.map(doc => doc.data()))
const createUser = async () => {
  if (
    !(await form.value?.validate())?.valid ||
      !email.value ||
      !password.value
  ) {
    return
  }
  loading.value = true
  try {
    const { data } = await functions<
        { email: string; password: string; role: { admin: true } },
        LocalUserType
      >('createAdmin')({
        email: email.value,
        password: password.value,
        role: { admin: true }
      })
    users.value.push(data)
    dialog.value = false
  } finally {
    loading.value = false
  }
}
const removeUser = async (id: string) => {
  removing.value = id
  try {
    await functions('removeAdmin')({ id })
    users.value = users.value.filter(user => user.id !== id)
  } finally {
    removing.value = null
  }
}
function getRole (role: { admin: true } | undefined) {
  if (!role) {
    return 'Utilisateur'
  }
  if (role.admin) {
    return 'Admin'
  }
}
</script>
