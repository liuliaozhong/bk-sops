/**
* Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community
* Edition) available.
* Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
* Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://opensource.org/licenses/MIT
* Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
* an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
* specific language governing permissions and limitations under the License.
*/
<template>
    <div class="tag-textarea">
        <el-input
            ref="tagTextarea"
            type="textarea"
            v-model="textareaValue"
            :class="{ 'rf-view-textarea-value': !formMode }"
            :disabled="!editable || !formMode || disabled"
            :autosize="formMode ? { minRows: 2 } : true"
            resize="none"
            :placeholder="placeholder"
            @blur="handleBlur">
        </el-input>
        <span v-show="!validateInfo.valid" class="common-error-tip error-info">{{validateInfo.message}}</span>
    </div>
</template>
<script>
    import '@/utils/i18n.js'
    import i18n from '@/config/i18n/index.js'
    import { getFormMixins } from '../formMixins.js'

    export const attrs = {
        value: {
            type: String,
            required: false,
            default: ''
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false,
            desc: i18n.t('禁用组件')
        },
        placeholder: {
            type: String,
            required: false,
            default: '',
            desc: 'placeholder'
        }
    }
    export default {
        name: 'TagTextarea',
        mixins: [getFormMixins(attrs)],
        computed: {
            textareaValue: {
                get () {
                    if (!this.formMode && ['', undefined].includes(this.value)) {
                        return '--'
                    }
                    return this.value
                },
                set (val) {
                    this.updateForm(val)
                }
            }
        },
        watch: {
            formMode () {
                /**
                 * 重新计算 textarea 高度，解决 disabled 下有滚动条和空白问题
                 * resizeTextarea 为非官方暴露 api，后续需关注 element textarea 组件该问题修复后删除
                 */
                this.$nextTick(() => {
                    this.$refs.tagTextarea.resizeTextarea()
                })
            }
        },
        methods: {
            handleBlur () {
                this.emit_event(this.tagCode, 'blur', this.value)
                this.$emit('blur', this.value)
            }
        }
    }
</script>
<style lang="scss">
@import '@/scss/mixins/scrollbar.scss';
.tag-textarea {
    .el-textarea__inner {
        padding-left: 10px;
        padding-right: 10px;
        font-size: 12px;
        word-break: break-all;
        @include scrollbar;
    }
}
.rf-view-textarea-value {
    .el-textarea__inner {
        padding: 6px 0;
        line-height: 24px;
        color: #333333;
        border: none;
        resize: none;
        &[disabled = "disabled"] {
            background: inherit;
            color: inherit;
            cursor: text;
        }
    }
}
</style>
