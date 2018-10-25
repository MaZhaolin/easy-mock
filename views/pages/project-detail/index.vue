<template>
  <div class="em-proj-detail">
    <em-header icon="cube"
               :title="project.name"
               :description="page.description"
               :nav="nav"
               v-model="pageName">
    </em-header>
    <div v-shortkey="['tab']"
         @shortkey="handleKeyTab()"></div>
    <em-keyboard-short v-model="keyboards"></em-keyboard-short>
    <Back-top>
      <em-add icon="arrow-up-c"
              :bottom="90"></em-add>
    </Back-top>
    <transition name="fade"
                mode="out-in">
      <project v-if="pageName === $t('p.detail.nav[1]')"
               key="a"
               :project-data="project"></project>
      <div class="em-container"
           v-if="pageAnimated && pageName === $t('p.detail.nav[0]')"
           key="b">
        <!-- <div class="em-proj-detail__info">
          <Row>
            <Col span="19">
              <em-spots :size="6"></em-spots>
              {{project.description}}
              <p class="tag">
                <span>Base URL</span>
                {{baseUrl}}
              </p>
              <p class="tag">
                <span>Project ID</span>
                {{project._id}}
              </p>
            </Col>
            <Col span="5">
              <div>
                <img :src="group ? '/public/images/group-default.png' : project.user.head_img" />
                <p class="author">{{group ? group.name : project.user.nick_name}}</p>
              </div>
            </Col>
          </Row>
        </div> -->
        <!-- <div class="em-proj-detail__members" v-if="project.members.length">
          <em-spots :size="6"></em-spots>
          <h2><Icon type="person-stalker"></Icon> {{$t('p.detail.member')}}</h2>
          <Row :gutter="20">
            <Col span="2" v-for="(item, index) in project.members" :key="index">
              <img :src="item.head_img" :title="item.nick_name"/>
            </Col>
          </Row>
        </div> -->
        <div style="display: inline-block;vertical-align: top;margin-top: 20px;">
          <div style="margin-bottom: 10px">
            <Input v-model="temp.name"
                   placeholder="分组名"
                   style="width: 184px" />
            <Button type="primary"
                    @click="addMockGroup">增加</Button>
          </div>
          <Menu :active-name="activeGroup"
                @on-select="onGroupChange">
            <MenuGroup title="接口分组">
              <MenuItem v-for="(item, index) in groups"
                        :key="index"
                        :name="item._id">{{item.name}}</MenuItem>
            </MenuGroup>
          </Menu>
        </div>
        <div style="width: 909px;display:inline-block;margin-left: 10px;margin-top: 20px;">
          <div class="em-proj-detail__switcher">
            <ul>
              <li @click="openEditor()"
                  v-shortkey="['ctrl', 'n']"
                  @shortkey="openEditor()">
                <Icon type="plus-round"></Icon> {{$t('p.detail.create.action')}}
              </li>
            </ul>
          </div>
          <div style="position: relative">
            <Table border
                   :columns="columns"
                   :data="list"
                   @on-selection-change="selectionChange"
                   :highlight-row="true">
            </Table>
            <Spin size="large"
                  fix
                  v-if="loading"></Spin>
          </div>
        </div>
      </div>
    </transition>
    <Modal v-model="invisible"
           title="选择移动到的分组"
           @on-ok="moveHandle">
      <Select v-model="select"
              style="width:200px">
        <Option v-for="item in groups"
                :value="item._id"
                :key="item._id">{{ item.name }}</Option>
      </Select>
    </Modal>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
/* eslint-disable */
import Clipboard from 'clipboard'
import debounce from 'lodash/debounce'

import * as api from '../../api'
import Project from '../new/project'
import MockExpand from './mock-expand'

export default {
  name: 'projectDetail',
  data() {
    return {
      pageName: this.$t('p.detail.nav[0]'),
      selection: [],
      keywords: '',
      invisible: false,
      select: '',
      selectMock: {},
      nav: [
        { title: this.$t('p.detail.nav[0]'), icon: 'android-list' },
        { title: this.$t('p.detail.nav[1]'), icon: 'gear-a' }
      ],
      keyboards: [
        {
          category: this.$t('p.detail.keyboards[0].category'),
          list: [
            {
              description: `${this.$t('p.detail.nav[0]')}/${this.$t(
                'p.detail.nav[1]'
              )}`,
              shorts: ['tab']
            }
          ]
        },
        {
          category: this.$t('p.detail.keyboards[1].category'),
          list: [
            {
              description: this.$t('p.detail.keyboards[1].list[0]'),
              shorts: ['ctrl', 'n']
            },
            {
              description: this.$t('p.detail.keyboards[1].list[1]'),
              shorts: ['ctrl', 'w']
            },
            {
              description: this.$t('p.detail.keyboards[1].list[2]'),
              shorts: ['ctrl', 's']
            }
          ]
        }
      ],
      columns: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(MockExpand, {
              props: {
                mock: params.row
              }
            })
          }
        },
        {
          title: 'Method',
          width: 110,
          key: 'method',
          filters: [
            { label: 'get', value: 'get' },
            { label: 'post', value: 'post' },
            { label: 'put', value: 'put' },
            { label: 'delete', value: 'delete' },
            { label: 'patch', value: 'patch' }
          ],
          filterMethod(value, row) {
            return row.method.indexOf(value) > -1
          },
          render: (h, params) => {
            const color = {
              get: 'blue',
              post: 'green',
              delete: 'red',
              put: 'yellow',
              patch: 'yellow'
            }
            return (
              <tag class="method-tag" color={color[params.row.method]}>
                {params.row.method.toUpperCase()}
              </tag>
            )
          }
        },
        {
          title: 'URL',
          width: 220,
          ellipsis: true,
          sortable: true,
          key: 'url'
        },
        {
          title: this.$t('p.detail.columns[0]'),
          ellipsis: true,
          key: 'description'
        },
        {
          title: this.$t('p.detail.columns[1]'),
          key: 'action',
          width: 160,
          align: 'center',
          render: (h, params) => {
            return (
              <div>
                <Button-group>
                  <i-button
                    size="small"
                    title={this.$t('p.detail.action[0]')}
                    onClick={this.preview.bind(this, params.row)}>
                    <icon type="eye" />
                  </i-button>
                  <i-button
                    size="small"
                    title={this.$t('p.detail.action[1]')}
                    onClick={this.openEditor.bind(this, params.row)}>
                    <icon type="edit" />
                  </i-button>
                  <i-button
                    size="small"
                    title={this.$t('p.detail.action[2]')}
                    class="copy-url"
                    onClick={this.clip.bind(this, params.row.url)}>
                    <icon type="link" />
                  </i-button>
                </Button-group>
                <dropdown>
                  <i-button size="small">
                    <icon type="more" />
                  </i-button>
                  <dropdown-menu slot="list">
                    <dropdown-item
                      nativeOnClick={this.clone.bind(this, params.row)}>
                      <icon type="ios-copy" /> {this.$t('p.detail.action[3]')}
                    </dropdown-item>
                    <dropdown-item
                      nativeOnClick={this.download.bind(this, params.row._id)}>
                      <icon type="ios-download" />{' '}
                      {this.$tc('p.detail.download', 2)}
                    </dropdown-item>
                    <dropdown-item
                      nativeOnClick={this.remove.bind(this, params.row._id)}>
                      <icon type="trash-b" /> {this.$t('p.detail.action[4]')}
                    </dropdown-item>
                    <dropdown-item
                      nativeOnClick={this.move.bind(this, params.row)}>
                      <icon type="paper-airplane" /> 移动
                    </dropdown-item>
                  </dropdown-menu>
                </dropdown>
              </div>
            )
          }
        }
      ],
      temp: {
        name: '',
        description: 'desc'
      },
      activeGroup: ''
    }
  },
  asyncData({ store, route }) {
    store.commit('mock/INIT_REQUEST')
    // store.commit('mockGroup/INIT_REQUEST')
    route.params.groupId
      ? store.dispatch('mock/FETCH', route.params.groupId)
      : store.commit('mockGroup/INIT_REQUEST')
    return store.dispatch('mockGroup/FETCH', route)
  },
  mounted() {
    const list = this.$store.state.mockGroup.list
    this.activeGroup = this.$route.params.groupId
    if (list.length > 0 && !this.activeGroup) {
      this.activeGroup = list[0]._id
      this.$store.dispatch('mock/FETCH', this.activeGroup)
    }
    this.$on(
      'query',
      debounce(keywords => {
        this.keywords = keywords
      }, 500)
    )
  },
  computed: {
    project() {
      return this.$store.state.mockGroup.project
    },
    loading() {
      return this.$store.state.mock.loading
    },
    groups() {
      const list = this.$store.state.mockGroup.list
      return list
    },
    list() {
      const list = this.$store.state.mock.list
      const reg = this.keywords && new RegExp(this.keywords, 'i')
      return reg
        ? list.filter(
            item =>
              reg.test(item.name) || reg.test(item.url) || reg.test(item.method)
          )
        : list
    },
    page() {
      return {
        description: this.project.user
          ? this.$t('p.detail.header.description[0]')
          : this.$t('p.detail.header.description[1]')
      }
    },
    baseUrl() {
      const baseUrl = location.origin + '/mock/' + this.project._id
      return this.project.url === '/' ? baseUrl : baseUrl + this.project.url
    },
    group() {
      return this.project.group
    }
  },
  methods: {
    addMockGroup() {
      api.mockGroup
        .create({
          data: {
            ...this.temp,
            project_id: this.project._id
          }
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success('分组创建成功')
            this.temp.name = ''
            this.$store.commit('mockGroup/INIT_REQUEST')
            this.$store.dispatch('mockGroup/FETCH', this.$route)
            this.close()
          }
        })
    },
    onGroupChange(name) {
      this.$router.push({
        name: 'project',
        params: {
          id: this.project._id,
          groupId: name
        }
      })
      this.activeGroup = name
      // this.$store.dispatch('mock/FETCH', name)
    },
    handleKeyTab() {
      this.pageName =
        this.pageName === this.$t('p.detail.nav[1]')
          ? this.$t('p.detail.nav[0]')
          : this.$t('p.detail.nav[1]')
    },
    clip(mockUrl) {
      const clipboard = new Clipboard('.copy-url', {
        text: () => {
          return mockUrl
        }
      })
      clipboard.on('success', e => {
        e.clearSelection()
        clipboard.destroy()
        this.$Message.success(this.$t('p.detail.copySuccess'))
      })
    },
    preview(mock) {
      let str = mock.params.map(v => v.split(':')[0]).join('=&')
      window.open(
        this.baseUrl + mock.url + '?' + str + '#!method=' + mock.method
      )
    },
    selectionChange(selection) {
      this.selection = selection
    },
    download(mockId) {
      if (typeof mockId === 'string') {
        const ids = this.selection.length
          ? this.selection.map(item => item._id)
          : [mockId]
        api.mock.export(ids)
      } else {
        api.mock.export(this.project._id)
      }
    },
    updateBySwagger() {
      if (!this.project.swagger_url) {
        this.$Message.warning(this.$t('p.detail.syncSwagger.warning'))
        return
      }
      this.$Modal.confirm({
        title: this.$t('confirm.title'),
        content: this.$t('p.detail.syncSwagger.confirm'),
        onOk: () => {
          api.project
            .updateSwagger({
              data: { id: this.project._id }
            })
            .then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('p.detail.syncSwagger.success'))
                this.$store.commit('mock/SET_REQUEST_PARAMS', { pageIndex: 1 })
                this.$store.dispatch('mock/FETCH', this.$route)
              }
              return res
            })
        }
      })
    },
    remove(mockId) {
      const ids = this.selection.length
        ? this.selection.map(item => item._id)
        : [mockId]
      this.$Modal.confirm({
        title: this.$t('confirm.title'),
        content:
          ids.length > 1
            ? this.$t('p.detail.remove.confirm[0]')
            : this.$t('p.detail.remove.confirm[1]'),
        onOk: () => {
          api.mock
            .delete({
              data: { project_id: this.project._id, ids }
            })
            .then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('p.detail.remove.success'))
                this.$store.commit('mock/SET_REQUEST_PARAMS', { pageIndex: 1 })
                this.$store.dispatch('mock/FETCH', this.$route.params.groupId)
              }
            })
        }
      })
    },
    move(mock) {
      this.selectMock = mock
      this.invisible = true
    },
    moveHandle() {
      api.mock
        .update({
          data: {
            ...this.selectMock,
            id: this.selectMock._id,
            group_id: this.select
          }
        })
        .then(res => {
          this.$Message.success('移动成功')
          this.$store.commit('mock/SET_REQUEST_PARAMS', { pageIndex: 1 })
          this.$store.dispatch('mock/FETCH', this.$route.params.groupId)
        })
    },
    handleWorkbench() {
      this.$store.dispatch('project/WORKBENCH', this.project.extend)
    },
    clone(mock) {
      this.$store
        .dispatch('mock/CREATE', {
          route: this.$route,
          ...mock,
          url: `${mock.url}_copy_${new Date().getTime()}`
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success(this.$t('p.detail.create.success'))
          }
        })
    },
    openEditor(mock) {
      if (mock) {
        this.$store.commit('mock/SET_EDITOR_DATA', {
          mock,
          baseUrl: this.baseUrl
        })
        this.$router.push(
          `/editor/${this.project._id}/${this.activeGroup}/${mock._id}`
        )
      } else {
        this.$router.push(`/editor/${this.project._id}/${this.activeGroup}`)
      }
    }
  },
  components: {
    Project
  }
}
</script>
