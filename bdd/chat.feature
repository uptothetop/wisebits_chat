Feature: Real-Time Chat
    As a registered user
    I want to be able to send and receive messages in real-time
    So that I can communicate with other users

    @happy_path
    Scenario: Start New Conversation
        Given I am logged in as "UserA"
        And I am on the Home page
        When I search for "UserB"
        And I click on "UserB" in the search results
        Then a new conversation with "UserB" should appear in the sidebar
        And the chat window for "UserB" should be active

    @happy_path
    Scenario: Send and Receive Message
        Given I am logged in as "UserA"
        And I have an active conversation with "UserB"
        When I type "Hello UserB" in the message input
        And I click "Send"
        Then the message "Hello UserB" should appear in my chat window
        And "UserB" should see "Hello UserB" in their chat window instantly

    @unhappy_path
    Scenario: Send Empty Message
        Given I am logged in as "UserA"
        And I have an active conversation with "UserB"
        When I leave the message input empty
        And I click "Send"
        Then the message should not be sent
        And no new message bubble should appear

    @security
    Scenario: Accessing Unauthorized Conversation via API
        Given I am logged in as "UserA"
        And "UserC" has a private conversation with "UserD" (ID: "conv_cd")
        When I attempt to fetch messages from conversation "conv_cd" via API
        Then I should receive a 403 Forbidden or 404 Not Found response

    @security
    Scenario: XSS Attack via Message Content
        Given I am logged in as "Attacker"
        And I have an active conversation with "Victim"
        When I send a message "<script>alert('XSS')</script>"
        Then the message should be displayed as plain text to "Victim"
        And the script should not execute
