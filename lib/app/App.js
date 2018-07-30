import Vue from 'vue'
<% if (loading) { %>import NuxtLoading from '<%= (typeof loading === "string" ? loading : "./components/nuxt-loading.vue") %>'<% } %>
<% css.forEach(function (c) { %>
import '<%= relativeToBuild(resolvePath(c.src || c)) %>'
<% }) %>
// load layout file sync
<%
var layoutsKeys = Object.keys(layouts);
layoutsKeys.forEach(function (key, i) { %>
import _<%= key.replace('-', '_') %> from '<%= layouts[key] %>'
<% }) %>

let resolvedLayouts = {
<%
var layoutsKeys = Object.keys(layouts);
layoutsKeys.forEach(function (key, i) { %>
  '_<%= key %>': _<%= key.replace('-', '_') %><%= (i + 1) < layoutsKeys.length ? ',' : '' %>
<% }) %>
}

export default {
  head: <%= serialize(head).replace('head(', 'function(').replace('titleTemplate(', 'function(') %>,
  render(h, props) {
    <% if (loading) { %>const loadingEl = h('nuxt-loading', { ref: 'loading' })<% } %>
    const layoutEl = h(this.layout || 'nuxt')
    const templateEl = h('div', {
      domProps: {
        id: '__layout'
      },
      key: this.layoutName
    }, [ layoutEl ])

    const transitionEl = h('transition', {
      props: {
        name: '<%= layoutTransition.name %>',
        mode: '<%= layoutTransition.mode %>'
      }
    }, [ templateEl ])

    return h('div',{
      domProps: {
        id: '__nuxt'
      }
    }, [
      <% if (loading) { %>loadingEl,<% } %>
      transitionEl
    ])
  },
  data: () => ({
    layout: null,
    layoutName: ''
  }),
  beforeCreate () {
    Vue.util.defineReactive(this, 'nuxt', this.$options.nuxt)
  },
  created () {
    // Add this.$nuxt in child instances
    Vue.prototype.$nuxt = this
    // add to window so we can listen when ready
    if (typeof window !== 'undefined') {
      window.$nuxt = this
    }
    // Add $nuxt.error()
    this.error = this.nuxt.error
  },
  <% if (loading) { %>
  mounted () {
    this.$loading = this.$refs.loading
  },
  watch: {
    'nuxt.err': 'errorChanged'
  },
  <% } %>
  methods: {
    <% if (loading) { %>
    errorChanged () {
      if (this.nuxt.err && this.$loading) {
        if (this.$loading.fail) this.$loading.fail()
        if (this.$loading.finish) this.$loading.finish()
      }
    },
    <% } %>
    setLayout (layout) {
      if (!layout || !resolvedLayouts['_' + layout]) layout = 'default'
      this.layoutName = layout
      let _layout = '_' + layout
      this.layout = resolvedLayouts[_layout]
      return this.layout
    },
    loadLayout (layout) {
      if (!layout || resolvedLayouts['_' + layout]) layout = 'default'
      let _layout = '_' + layout

      return Promise.resolve(resolvedLayouts[_layout])
    }
  },
  components: {
    <%= (loading ? 'NuxtLoading' : '') %>
  }
}

