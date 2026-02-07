Feature: Authentication
  As a user
  I want to be able to register and log in
  So that I can access the chat features securely

  @happy_path
  Scenario: Successful User Registration
    Given I am on the Registration page
    When I enter a unique username "newuser"
    And I enter a valid email "newuser@example.com"
    And I enter a strong password "Pass123!"
    And I click the "Register" button
    Then I should be redirected to the Home page
    And I should see "Hi, newuser" in the navigation bar

  @happy_path
  Scenario: Successful User Login
    Given I am on the Login page
    When I enter a registered username "existinguser"
    And I enter the correct password "Pass123!"
    And I click the "Login" button
    Then I should be redirected to the Home page
    And I should receive a valid JWT token

  @unhappy_path
  Scenario: Registration with Existing Username
    Given I am on the Registration page
    When I enter a username "existinguser" that is already taken
    And I enter a valid email "unique@example.com"
    And I enter a password "Pass123!"
    And I click "Register"
    Then I should see an error message "User with this email or username already exists"

  @unhappy_path
  Scenario: Login with Incorrect Password
    Given I am on the Login page
    When I enter a valid username "existinguser"
    And I enter an incorrect password "WrongPass"
    And I click "Login"
    Then I should see an error message "Invalid credentials"

  @security
  Scenario: NoSQL Injection Attempt on Login
    Given I am on the Login page
    When I enter a username "admin"
    And I enter a password "{$ne: null}"
    And I click "Login"
    Then I should not be logged in
    And I should see an error message "Invalid credentials"
