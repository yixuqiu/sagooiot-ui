<template>
	<div class="system-edit-dic-container">
		<el-dialog :title="(typeof ruleForm.valueType !== 'undefined' ? '修改' : '添加') + '参数'" v-model="isShowDialog" width="769px">
			<el-form :model="ruleForm" ref="formRef" :rules="rules" label-width="120px">
				<el-form-item label="参数标识" prop="key">
					<el-input v-model="ruleForm.key" placeholder="请输入参数标识" />
				</el-form-item>
				<el-form-item label="参数名称" prop="name">
					<el-input v-model="ruleForm.name" placeholder="请输入参数名称" />
				</el-form-item>

				<el-form-item label="数据类型" prop="type">
					<el-select v-model="valueType.type" placeholder="请选择数据类型" @change="seletChange">
						<el-option-group v-for="group in typeData" :key="group.label" :label="group.label">
							<el-option v-for="item in group.options" :key="item.type" :label="item.title" :value="item.type" />
						</el-option-group>
					</el-select>
				</el-form-item>

				<TypeItem :valueType="valueType" :typeData="typeData"></TypeItem>
				<div v-if="type == 'array'">
					<el-form-item label="元素类型" prop="type">
						<el-select v-model="elementType.type" placeholder="请选择元素类型" @change="seletChanges">
							<el-option-group v-for="group in typeData" :key="group.label" :label="group.label">
								<el-option v-for="item in group.options" :key="item.type" :label="item.title" :value="item.type" :disabled="['array', 'enum'].includes(item.type)" />
							</el-option-group>
						</el-select>
					</el-form-item>
					<TypeItem :valueType="elementType" :typeData="typeData"></TypeItem>
				</div>

				<el-form-item label="参数描述	" prop="desc">
					<el-input v-model="ruleForm.desc" type="textarea" placeholder="请输入参数描述"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel">取 消</el-button>
					<el-button type="primary" @click="onSubmit">{{ typeof ruleForm.valueType !== 'undefined' ? '修 改' : '添 加' }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts">
import { reactive, toRefs, defineComponent, ref, unref } from 'vue';
import api from '/@/api/device';
import TypeItem from './typeItem.vue';
import { Plus, Minus, Right } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { validateNoSpace } from '/@/utils/validator';

interface stateType {
	isShowDialog: boolean
	rules: any
	ruleForm: any
	valueType: any
	typeData: any
	elementType: any
	type: string
	[key: string]: any
}

const valueTypeBase = {
	// max: null,
	// min: null,
	unit: null,
	decimals: null,
	trueText: '是',
	falseText: '否',
	trueValue: true,
	falseValue: false,
	type: null,
	maxLength: null,
}

const valueType = {
	...JSON.parse(JSON.stringify(valueTypeBase)),
	properties: [{
		'key': '',
		'name': '',
		'desc': '',
		'valueType': {
			...JSON.parse(JSON.stringify(valueTypeBase)),
			elements: [{
				'text': '',
				'value': ''
			}]
		}
	}],
	elements: [{
		'text': '',
		'value': ''
	}]
}

export default defineComponent({
	name: 'deviceEditPro',
	components: { Plus, Minus, Right, TypeItem },
	setup(prop, { emit }) {
		const formRef = ref<HTMLElement | null>(null);

		const state = reactive<stateType>({
			isShowDialog: false,
			typeData: [], //
			type: '',
			types: '',
			valueType: JSON.parse(JSON.stringify(valueType)),
			elementType: JSON.parse(JSON.stringify(valueType)),
			properties: [JSON.parse(JSON.stringify(valueType))],
			enumdata: [
				{
					'text': '',
					'value': '',
				},
			],
			ruleForm: {
				id: 0,
				name: '',
				key: '',
				transportProtocol: '',
				accessMode: '0',
				status: 1,
				valueType: {},
				desc: '',
			},
			rules: {
				name: [
					{ required: true, message: '参数名称不能为空', trigger: 'blur' },
					{ max: 32, message: '参数名称不能超过32个字符', trigger: 'blur' },
					{ validator: validateNoSpace, message: '参数名称不能包含空格', trigger: 'blur' }
				],
				key: [{ required: true, message: '参数标识不能为空', trigger: 'blur' }],
				accessMode: [{ required: true, message: '请选择是否只读', trigger: 'blur' }],
			},
		});

		// 打开弹窗
		const openDialog = (row?: any) => {
			resetForm();

			api.product.getDataType({ status: -1 }).then((res: any) => {
				const datat: any = Object.values(res.dataType);
				datat.forEach((item: any, index: number) => {
					if (index == 0) {
						datat[index]['label'] = '基础类型';
						datat[index]['options'] = item;
					} else {
						datat[index]['label'] = '扩展类型';
						datat[index]['options'] = item;
					}
				});
				state.typeData = datat || [];
			});

			if (row) {
				if (typeof row.valueType !== 'undefined') {
					state.type = row.valueType.type;

					if (typeof row.valueType.elementType !== 'undefined') state.elementType = row.valueType.elementType;
					if (typeof row.valueType.elements !== 'undefined') state.enumdata = row.valueType.elements;
					if (typeof row.valueType.properties !== 'undefined') state.properties = row.valueType.properties;
					if (typeof row.valueType.type !== 'undefined') state.valueType.type = row.valueType.type;

					const fieldCount = Object.keys(row.valueType).length;
					if (fieldCount > 1) state.valueType = row.valueType;
				}

				state.ruleForm = row;
			}
			state.isShowDialog = true;
		};
		const resetForm = () => {
			state.ruleForm = {
				name: '',
				desc: '',
			};
			state.valueType = JSON.parse(JSON.stringify(valueType));
			state.enumdata = [{
				'text': '',
				'value': '',
			}];
			state.elementType = JSON.parse(JSON.stringify(valueType));
		};

		const seletChange = (val: string) => {

			state.type = val;
		};
		const seletChanges = (val: string) => {
			state.types = val;
		};

		const addEnum = () => {
			state.enumdata.push({
				'text': '',
				'value': '',
			});
		};
		const delEnum = (index: number) => {
			state.enumdata.splice(index, 1);
		}

		// 关闭弹窗
		const closeDialog = () => {
			state.isShowDialog = false;
		};
		// 取消
		const onCancel = () => {
			closeDialog();
		};
		// 新增
		const onSubmit = () => {
			const formWrap = unref(formRef) as any;
			if (!formWrap) return;
			formWrap.validate((valid: boolean) => {
				if (valid) {
					if (typeof state.ruleForm.valueType !== 'undefined') {
						//修改

						if (state.type == 'array') {
							state.valueType.elementType = state.elementType;
						}

						state.ruleForm.valueType = state.valueType;
						// ElMessage.success('参数类型修改成功');
						closeDialog(); // 关闭弹窗
						emit('editTypeList', state.ruleForm, state.ruleForm.type_data);
					} else {
						// //添加

						if (state.type == 'array') {
							state.valueType.elementType = state.elementType;
						}

						state.ruleForm.valueType = state.valueType;
						ElMessage.success('参数类型添加成功');
						closeDialog(); // 关闭弹窗
						emit('typeList', state.ruleForm, state.ruleForm.type_data);
					}
				}
			});
		};

		return {
			openDialog,
			addEnum,
			delEnum,
			seletChange,
			seletChanges,
			closeDialog,
			onCancel,
			onSubmit,
			formRef,
			...toRefs(state),
		};
	},
});
</script>
<style scoped>
.input-box {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	margin-top: 10px;
}

.input-option {
	line-height: 30px;
	padding-top: 5px;
	width: 140px;
}

.input-option i {
	margin: 0px 5px;
	border: 1px solid #c3c3c3;
	font-size: 16px;
}

.input-options {
	display: flex;
	align-items: center;
	color: #409eff;
	cursor: pointer
}
</style>
