# Description of Issue
When attempting to upload a transcript whose student ID is not currently in the database, the system returns the below backend readout. This has also exposed another issue in which a user can upload a transcript that does not belong to them as long as the student ID on the transcript is currently within the system. ![alt text](error.png)

# Steps to Reproduce
1. Login to the myAdvisor system with any student account.
2. Navigate to the "Academic History" section ({host}/dashboard/academic-history).
3. Upload a transcript whose student ID *does not* match the student ID on the account.

A sample transcript is provided in this folder, this will generate the error when uploaded to the testing account.