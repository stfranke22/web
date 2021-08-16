<template>
  <span :id="`files-role-${role.name}`" class="roles-select-role-item">
    <span
      class="oc-text-bold uk-display-block uk-width-1-1 roles-select-role-item-label"
      v-text="role.label"
    />
    <span class="oc-m-rm roles-select-role-item-description" v-text="role.description" />
  </span>
</template>

<script>
export default {
  name: 'RoleItem',
  props: {
    role: {
      type: Object,
      required: true
    }
  }
}
</script>
