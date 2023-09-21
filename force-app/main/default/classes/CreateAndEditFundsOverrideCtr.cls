/************************************************************************************************************
* @author Globant - Leonardo Monsalvo
* @description  
* @date 18-09-2023
* @group Salesforce Factory
* Versions
* -----------------------------------------------------------------------------------------------------------
* No.   Date            Author                  	Description
* ---   ----------      ---------------            	----------------------------------------------------------
* 1.0   18-09-2023		Leonardo Monsalvo			Creation Class
**************************************************************************************************************/
public with sharing class CreateAndEditFundsOverrideCtr{
    @AuraEnabled(cacheable = true)
    public static List<PicklistValueInfo> fetchFundType(String searchKey){

        String strKey = '%' + searchKey + '%';

        EntityDefinition objED = [SELECT Id, DurableId
                                  FROM EntityDefinition
                                  WHERE QualifiedApiName = 'Trust_Fund__c'];

        FieldDefinition objFD = [SELECT Id, DurableId
                                 FROM FieldDefinition
                                 WHERE EntityDefinitionId = :objED.DurableId AND QualifiedAPIName = 'Type_of_Fund__c'];

        return [SELECT Id, Label, Value
                FROM PicklistValueInfo
                WHERE EntityParticleId = :objFD.DurableId AND Value LIKE:strKey
                LIMIT 10];
    }

    @AuraEnabled(cacheable = true)
    public static List<Trust_Fund__c> getFunds(String trustId){
        return [SELECT Id, Type_of_Fund__c, Amount__c FROM Trust_Fund__c WHERE Opportunity_Product__c =: trustId ORDER BY CreatedDate DESC LIMIT 5000];
    }

}