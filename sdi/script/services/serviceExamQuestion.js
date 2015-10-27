'use strict';

/**
 *
 * @ngdoc service
 * @name sdi.service:serviceExamQuestion
 * @description Service to provide all required question to be asked from user before an appointment must be added.
 * All questions are generated on basis of exam/test type selected.
 */

angular.module('sdi')
.provider('serviceExamQuestion', function () {
  
	//Private objects
	var unique = function(a) {
		//var a = this.concat();
		for(var i=0; i<a.length; ++i) {
		for(var j=i+1; j<a.length; ++j) {
			if(a[i] === a[j])
			a.splice(j, 1);
		}
		}
		return a;
	}; 
	
	var allQuestions = [
		{
			questionId:   1,
			question : 'DexaExamReason',
			answerType: 'checkbox',
			isRequired : true,
			note: 'checkAll',
			answerOption : ['Screening', 'Osteopenia', 'Osteoporosis', 'Other'],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['DEXA']
		},
		{
			questionId:   2,
			question : 'HaveContrastExam',
			answerType: 'radio',
			isRequired : true,
			note: 'appointmentNote',
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [{
							questionId:   3,
							question : 'DateOfLastExam',
							answerType: 'datePicker',
							isRequired : true,
							note: '',
							answerOption : [],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['DEXA']
						}],
			childQuestion_no : [],
			
			questionExistFor : ['DEXA']
		},
		{
			questionId:   4,
			question : 'PainLumpORDischarge',
			answerType: 'radio',
			isRequired : true,
			note: '',
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [{
							questionId:   5,
							question : 'DiagnosticMammogram',
							answerType: 'checkbox',
							isRequired : true,
							note: 'checkAll',
							answerOption : ['Pain', 'Lump', 'Discharge', 'Abnormal Screening', 'Other'],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Mammogram Screening','Mammogram Diagnostic', 'Breast']
						}],
			childQuestion_no : [],
			questionExistFor : ['Mammogram Screening']
		},
		{
			questionId:   6,
			question : 'DiagnosticMammogram',
			answerType: 'checkbox',
			isRequired : true,
			note: 'checkAll',
			answerOption : ['Pain', 'Lump', 'Discharge', 'Abnormal Screening', 'Other'],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['Mammogram Diagnostic', 'Breast']
		},
		{
			questionId:   7,
			question : 'HadPriorBreastExam',
			answerType: 'radio',
			isRequired : true,
			note: '',
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [
						{
							questionId:   8,
							question : 'DateOfLastExam',
							answerType: 'date',
							isRequired : true,
							note: '',
							answerOption : [],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Mammogram Screening', 'Mammogram Diagnostic', 'Breast']
						},
						{
							questionId:   9,
							question : 'LocationOfLastExam',
							answerType: 'text',
							isRequired : false,
							note: '',
							answerOption : [],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Mammogram Screening', 'Mammogram Diagnostic', 'Breast']
						},
						{
							questionId:   10,
							question : 'SixMonthFollowUp',
							answerType: 'radio',
							isRequired : true,
							note: '',
							answerOption : ['Yes','No'],
							questionLevel : 2,
							checkRefrenceFor : ['Mammogram Screening'],
							refrenceID : 4,
							refrenceValue : 'Yes',
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Mammogram Screening', 'Mammogram Diagnostic', 'Breast']
						},
						/*{
							questionId:  28,
							question : 'RecentScreening',
							answerType: 'radio',
							isRequired : true,
							note: '',
							answerOption : ['Yes','No'],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Mammogram Diagnostic', 'Breast']
						},*/
						{
							questionId:  11,
							question : 'DiagnosedWithBreastCancer',
							answerType: 'radio',
							isRequired : true,
							note: '',
							answerOption : ['Yes','No'],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Mammogram Screening', 'Mammogram Diagnostic', 'Breast']
						},
						{
							questionId:  12,
							question : 'BreastImpleants',
							answerType: 'radio',
							isRequired : true,
							note: '',
							answerOption : ['Yes','No'],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Mammogram Screening', 'Mammogram Diagnostic', 'Breast']
						}],
			
						childQuestion_no : [{
							questionId:   13,
							question : 'BreastImpleants',
							answerType: 'radio',
							isRequired : true,
							note: '',
							answerOption : ['Yes', 'No'],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Mammogram Screening', 'Mammogram Diagnostic', 'Breast']
						}],
			questionExistFor : ['Mammogram Screening', 'Mammogram Diagnostic', 'Breast']
		},
		{
			questionId:   14,
			question : 'WantSchedule3DMammo',
			answerType: 'radio',
			isRequired : true,
			note: '3dmammoNote',
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['Mammogram Screening', 'Mammogram Diagnostic', 'Breast']
		},
		{
			questionId:   15,
			question : 'pelvicReason',
			answerType: 'textarea',
			isRequired : true,
			note : '',
			answerOption : [],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['Pelvic']
		},
		{
			questionId:   16,
			question : 'PreviousImagingPelvic',
			answerType: 'radio',
			isRequired : true,
			note: '',
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [{
							questionId:   17,
							question : 'DateOfLastExam',
							answerType: 'date',
							isRequired : true,
							note: '',
							answerOption : [],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Pelvic']    
						},
						{
							questionId:   18,
							question : 'LocationOfLastExam',
							answerType: 'text',
							isRequired : false,
							note: '',
							answerOption : [],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Pelvic']    
						}],
			childQuestion_no : [],
			questionExistFor : ['Pelvic']
		},
		{
			questionId:   19,
			question : 'abdomenReason',
			answerType: 'textarea',
			isRequired : true,
			note : '',
			answerOption : [],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['Abdomen']
		},
			{
			questionId:   20,
			question : 'PreviousImagingAbdomen',
			answerType: 'radio',
			isRequired : true,
			note: '',
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [{
							questionId:   21,
							question : 'DateOfLastExam',
							answerType: 'date',
							isRequired : true,
							note: '',
							answerOption : [],
							questionLevel : 2,
							childCondition : '',
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Abdomen']    
						},
						{
							questionId:   22,
							question : 'LocationOfLastExam',
							answerType: 'text',
							isRequired : false,
							note: '',
							answerOption : [],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Abdomen']    
						}],
			childQuestion_no : [],
			questionExistFor : ['Abdomen']
		},
		{
			questionId:   23,
			question : 'cartoidReason',
			answerType: 'textarea',
			isRequired : true,
			note : '',	  
			answerOption : [],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['Carotid']
		},
		{
			questionId:   24,
			question : 'thyroidReason',
			answerType: 'textarea',
			isRequired : true,
			note : '',	  
			answerOption : [],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['Thyriod']
		},
		{
			questionId:   25,
			question : 'PreviousImagingNeck',
			answerType: 'radio',
			isRequired : true,
			note: '',
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [
						{
							questionId:   26,
							question : 'DateOfLastExam',
							answerType: 'date',
							isRequired : true,
							note: '',
							answerOption : [],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Carotid','Thyriod']    
						},
						{
							questionId:   27,
							question : 'LocationOfLastExam',
							answerType: 'text',
							isRequired : false,
							note: '',
							answerOption : [],
							questionLevel : 2,
							childQuestion_yes : [],
							childQuestion_no : [],
							questionExistFor : ['Carotid','Thyriod']    
						}],
			childQuestion_no : [],
			questionExistFor : ['Carotid','Thyriod']
		},
		//MRI Questions Start Here 
		{
			questionId:   28,
			question : 'hadPacemaker',
			answerType: 'radio',
			isRequired : true,
			note : '',	  
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
		},
		{
			questionId:   29,
			question : 'height',
			answerType: 'text',
			isRequired : true,
			note : '',	  
			answerOption : [],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
		},
		{
			questionId:   30,
			question : 'weight',
			answerType: 'text',
			isRequired : true,
			note : '',	  
			answerOption : [],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
		},
		{
			questionId:   31,
			question : 'yourState',
			answerType: 'checkbox',
			isRequired : true,
			note: 'checkAll',
			answerOption : ['withoutContrast', 'withContrast', 'notSure', 'preRadiologist'],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
		},
		{
			questionId:   32,
			question : 'alergyContrast',
			answerType: 'radio',
			isRequired : true,
			note: 'checkAll',
			answerOption : ['Yes','No'],
			questionLevel : 1,
			childQuestion_yes : [
									{
										questionId:   33,
										question : 'reactionOccurs',
										answerType: 'checkbox',
										isRequired : true,
										note: 'checkAll',
										answerOption : ['hives', 'sneezing', 'notSure', 'anaphlyactic', 'Other'],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
									},
									
								],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
		},
		{
			questionId:   34,
			question : 'alergyIodinContrast',
			answerType: 'radio',
			isRequired : true,
			note: 'checkAll',
			answerOption : ['Yes','No'],
			questionLevel : 1,
			childQuestion_yes : [
									{
										questionId:   35,
										question : 'reactionOccurs',
										answerType: 'checkbox',
										isRequired : true,
										note: 'checkAll',
										answerOption : ['hives', 'sneezing', 'notSure', 'anaphlyactic', 'Other'],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
									},
									
								],
			childQuestion_no : [],
			questionExistFor : ['ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
		},
		{
			questionId:   36,
			question : 'ctReason',
			answerType: 'textarea',
			isRequired : true,
			note : '',	  
			answerOption : [],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
		},
		{
			questionId:   37,
			question : 'ctSide',
			answerType: 'checkbox',
			isRequired : true,
			note: 'checkAll',
			answerOption : ['left', 'right'],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
		},
		
		{
			questionId:   38,
			question : 'mriReason',
			answerType: 'textarea',
			isRequired : true,
			note : '',	  
			answerOption : [],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
		},
		{
			questionId:   39,
			question : 'mriSide',
			answerType: 'checkbox',
			isRequired : true,
			note: 'checkAll',
			answerOption : ['left', 'right'],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
		},
		{
			questionId:   40,
			question : 'metalAnywhere',
			answerType: 'radio',
			isRequired : true,
			note : 'metalAnywhereNote',	  
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [
									{
										questionId:   41,
										question : 'DateOfLastExam',
										answerType: 'date',
										isRequired : true,
										note: '',
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
									},
									{
										questionId:   42,
										question : 'metalType',
										answerType: 'textarea',
										isRequired : true,
										note : '',	  
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
									},
									{
										questionId:   43,
										question : 'metalLocation',
										answerType: 'textarea',
										isRequired : true,
										note : '',	  
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
									},
								],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
		},
		{
			questionId:   44,
			question : 'hadSurgery',
			answerType: 'radio',
			isRequired : true,
			note : '',	  
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [
									{
										questionId:   45,
										question : 'DateOfLastExam',
										answerType: 'date',
										isRequired : true,
										note: '',
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
									},
									{
										questionId:   46,
										question : 'LocationOfLastExam',
										answerType: 'text',
										isRequired : false,
										note: '',
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
									},
									{
										questionId:   47,
										question : 'surgeryType',
										answerType: 'textarea',
										isRequired : true,
										note : '',	  
										answerOption : [],
										questionLevel : 1,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
									},
									
								],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
		},
		
		{
			questionId:   48,
			question : 'hadPreviousSurgery',
			answerType: 'radio',
			isRequired : true,
			note : '',	  
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [
									{
										questionId:   49,
										question : 'DateOfLastExam',
										answerType: 'date',
										isRequired : true,
										note: '',
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
									},
									{
										questionId:   50,
										question : 'LocationOfLastExam',
										answerType: 'text',
										isRequired : false,
										note: '',
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
									},
									{
										questionId:   51,
										question : 'surgeryType',
										answerType: 'textarea',
										isRequired : true,
										note : '',	  
										answerOption : [],
										questionLevel : 1,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
									},
									
								],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
		},
		{
			questionId:   52,
			question : 'diabitic',
			answerType: 'radio',
			isRequired : true,
			note : '',	  
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
		},
		{
			questionId:   53,
			question : 'kidneyFailure',
			answerType: 'radio',
			isRequired : true,
			note : '',	  
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
		},
		{
			questionId:   54,
			question : 'bloodPressure',
			answerType: 'radio',
			isRequired : true,
			note : '',	  
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
		},
		{
			questionId:   55,
			question : 'cancerDiagnosed',
			answerType: 'radio',
			isRequired : true,
			note : '',	  
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [
									{
										questionId:   56,
										question : 'DateOfLastExam',
										answerType: 'date',
										isRequired : true,
										note: '',
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
									},
									{
										questionId:   57,
										question : 'LocationOfLastExam',
										answerType: 'text',
										isRequired : false,
										note: '',
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
									},
									{
										questionId:   58,
										question : 'cancerType',
										answerType: 'textarea',
										isRequired : true,
										note : '',	  
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
									},
								],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
		},
		{
			questionId:   59,
			question : 'previousImagingDone',
			answerType: 'radio',
			isRequired : true,
			note : '',	  
			answerOption : ['Yes', 'No'],
			questionLevel : 1,
			childQuestion_yes : [
									{
										questionId:   60,
										question : 'DateOfLastExam',
										answerType: 'date',
										isRequired : true,
										note: '',
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
									},
									{
										questionId:   61,
										question : 'LocationOfLastExam',
										answerType: 'text',
										isRequired : false,
										note: '',
										answerOption : [],
										questionLevel : 2,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
									},
									{
										questionId:   62,
										question : 'whatImaged',
										answerType: 'textarea',
										isRequired : true,
										note : '',	  
										answerOption : [],
										questionLevel : 1,
										childQuestion_yes : [],
										childQuestion_no : [],
										questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le']
									},
								],
			childQuestion_no : [],
			questionExistFor : ['ankle_le', 'brain', 'c_spine', 'foot_le','hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le','ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis']
		}
		
		
		
	];
	
	var examWiseQuestions = {
					'DEXA' : [1,2],
					'Mammogram Screening'  : [4,7,14],
					'Mammogram Diagnostic' : [6,7,14],
					'Breast' :  [6,7,14],
					'Pelvic' :  [15,16],
					'Abdomen':  [19,20],
					'Carotid':  [23,25],
					'Thyriod':  [24,25],
					
					'ankle_le' 	: [28,29,30,31,32,38,39,40,44,48,52,53,54,55,59],
					'brain' 	: [28,29,30,31,32,38,39,40,44,48,52,53,54,55,59],
					'c_spine' 	: [28,29,30,31,32,38,39,40,44,48,52,53,54,55,59],
					'foot_le' 	: [28,29,30,31,32,38,39,40,44,48,52,53,54,55,59],
					'hip_le' 	: [28,29,30,31,32,38,39,40,44,48,52,53,54,55,59],
					'knee_le' 	: [28,29,30,31,32,38,39,40,44,48,52,53,54,55,59],
					'le_spine' 	: [28,29,30,31,32,38,39,40,44,48,52,53,54,55,59],
					'shoulder_le' : [28,29,30,31,32,38,39,40,44,48,52,53,54,55,59],
					't_spine' 	: [28,29,30,31,32,38,39,40,44,48,52,53,54,55,59],
					'elbow_le' 	: [28,29,30,31,32,38,39,40,44,48,52,53,54,55,59],
					'wrist_le' 	: [28,29,30,31,32,38,39,40,44,48,52,53,54,55,59],
					
					'ct_abdomen' : [29,30,31,34,36,37,52,53,54,55,59],
					'ct_brain_head' : [29,30,31,34,36,37,52,53,54,55,59],
					'ct_chest' : [29,30,31,34,36,37,52,53,54,55,59],
					'ct_neck' : [29,30,31,34,36,37,52,53,54,55,59],
					'ct_sinus' : [29,30,31,34,36,37,52,53,54,55,59],
					'ct_urogram' : [29,30,31,34,36,37,52,53,54,55,59],
					'ct_pelvis' : [29,30,31,34,36,37,52,53,54,55,59]
				};		  
	
	var examReasons  = {
					'DEXA' : [1],
					'Mammogram Screening'  : [4],
					'Mammogram Diagnostic' : [6],
					'Breast' :  [6],
					'Pelvic' :  [15],
					'Abdomen':  [19],
					'Carotid':  [23],
					'Thyriod':  [24],
					
					'ankle_le' 	: [38],
					'brain' 	: [38],
					'c_spine' 	: [38],
					'foot_le' 	: [38],
					'hip_le' 	: [38],
					'knee_le' 	: [38],
					'le_spine' 	: [38],
					'shoulder_le' : [38],
					't_spine' 	: [38],
					'elbow_le' 	: [38],
					'wrist_le' 	: [38],
					
					'ct_abdomen' : [36],
					'ct_brain_head' : [36],
					'ct_chest' : [36],
					'ct_neck' : [36],
					'ct_sinus' : [36],
					'ct_urogram' : [36],
					'ct_pelvis' : [36],
				};
				
	this.$get = ['serviceGlobal', function (serviceGlobal) {
    var parentChildMap = {
			    2	: [3],
			    4	: [6],
			    7	: [8,9,10,11,12,13],
			    16	: [17,18],
			    20	: [21,22],
			    25	: [26,27],
				32 : [33],
				34 : [35],
				40 : [41,42,43],
				44 : [45,46,47],
				48 : [49,50,51],
				55: [56,57,58],
				59 : [60,61,62]
			};
    
    
    var getQuestions = function(){
	
	var examData = serviceGlobal.home.examData;
	var questions = [];
	var examQuestionId =  [];
	var dupes = {};
	var singles = [];

	for(var ai=0; ai<examData.length;ai++){
	    examQuestionId = unique(examQuestionId.concat(examWiseQuestions[examData[ai]]));
	}
	
	for(var i=0; i <allQuestions.length; i++){
		if(examQuestionId.indexOf(allQuestions[i].questionId) !== -1){
		questions.push(allQuestions[i]);    
	    }
	}
	return {questions : questions, examQuestionId : examQuestionId, examWiseQuestions : examWiseQuestions, parentChildMap : parentChildMap};
    }
    
    var getExamReasons = function(){
      
      var examData = serviceGlobal.home.examData;
      var examQuestionId =  [];
      var examReasonText = '';
      
      for(var ai=0; ai<examData.length;ai++){
	  examQuestionId = unique(examQuestionId.concat(examReasons[examData[ai]]));
      }
      
      for(var qi = 0; qi < examQuestionId.length; qi++){
	if (serviceGlobal.exam.examAnswers[examQuestionId[qi]]) {
	  
	  if (angular.isArray(serviceGlobal.exam.examAnswers[examQuestionId[qi]]) || typeof serviceGlobal.exam.examAnswers[examQuestionId[qi]]  == 'object') {
	    angular.forEach(serviceGlobal.exam.examAnswers[examQuestionId[qi]], function(value, key){
		examReasonText +=  key + ',';  
	    });
	  }else{
	    examReasonText += serviceGlobal.exam.examAnswers[examQuestionId[qi]] + ',';    
	  }
	  
	}
      }
      return examReasonText;
    }
    
    var securityQuestions = function (){
      /*var securityQues = [
			  {ID : '0D79B498-7B5B-44EC-8443-448F39E13EB6', Question : Q1, CustomQustion : false},
			  {ID : '1C142AD9-1E7F-4462-B789-1C747070F2A6', Question : Q2, CustomQustion : false},
			  {ID : '2DE6AAA3-ADA0-46F9-99C9-D8B8457EB51D', Question : Q3, CustomQustion : false},
			  {ID : '2EFA8D4B-D269-4C42-902E-14C87783F624', Question : Q4, CustomQustion : false},
			  {ID : '9F9FFB52-A127-4C6D-85CE-F45EF912D5E6', Question : Q5, CustomQustion : false},
			  {ID : '6415D0C0-E304-4C9C-9177-7E88FCB68594', Question : Q6, CustomQustion : false},
			  {ID : '41542FC1-09BD-44CE-946D-688E82CD3C54', Question : Q7, CustomQustion : false},
			  {ID : '97237C80-387C-4633-AE68-B25F0FC2F55C', Question : Q8, CustomQustion : false},
			  {ID : 'C9709559-1AEF-495C-AB5D-1C8E9DB9CD13', Question : Q9, CustomQustion : false},
			  {ID : 'E21605B6-E6A2-4E07-8D16-79A928EFE7F9', Question : Q10, CustomQustion : false},
			  ];*/
      var securityQues = ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10'];
      var securityQues_en = ['What was the name of your elementary / primary school?',
				'What was your favorite place to visit as a child?',
				'In what county where you born?',
				'What is your pet’s name?',
				'What is the name of your favorite childhood teacher?',
				'What is your spouse or partner\'s mother\'s maiden name?',
				'What is the color of your eyes?',
				'What is your favorite sport?',
				'What is the name of the first beach you visited?',
				'What is your favorite color?'];
	
	var securityQues_es = ['¿Cuál era el nombre de su escuela primaria / primaria?',
				'¿Cuál era su lugar favorito para visitar cuando era niño?',
				'¿En qué condado donde usted nació?',
				'¿Cuál es el nombre de su mascota?',
				'¿Cuál es el nombre de su profesor favorito de la infancia?',
				'¿Cuál es su cónyuge o el apellido de soltera de la madre de pareja?',
				'¿Cuál es el color de sus ojos?',
				'¿Cuál es tu deporte favorito?',
				'¿Cuál es el nombre de la primera playa que ha visitado?',
				'¿Cuál es tu color favorito?'];
      return {securityQues : securityQues, securityQues_en : securityQues_en, securityQues_es : securityQues_es};
      
    }
    
    return {
      getQuestions : getQuestions,
      getExamReasons : getExamReasons,
      securityQuestions : securityQuestions()
    };
    
  }];
});