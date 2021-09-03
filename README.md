               Project-3: Social Poll App

Features
User
1-User should be able to login/sign up into the portal
2-User should be able to vote on poll
3-User should see the real time results for polls
Admin
1-As an admin I should be able to add the poll in portal
2-As an admin I should be able to remove the poll
3-As an admin I should be able get the report poll on particular date

API 1
1= As a registered user I should be able request an API to login into the app with username and password
When the user doesn't have a account, then send
Status code :400 and response as “Invalid User”
When the user provides an incorrect password, then send
Status code :400 and response as “Invalid Password”
When the user name and password correct, then send
The jwtToken as response
API 2
2= As a registered user user I should be able to vote on poll, so that I can cast my vote
API should update the status of user vote on the particular poll
API should display the count of votes in real time
API 3
3= As an admin, I should be able to add candidates, so that the candidate will participate in poll
API should add the candidate into the database

API 4
4= As an Admin, I should be able to get the detailed report of the candidates and count of votes
they got, so that admin will decide the poll winner
API to get the detailed report of the candidates containing the name, number of votes
