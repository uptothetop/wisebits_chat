Feature: Stories (Disappearing Content)
    As a user
    I want to share temporary photos and videos
    So that I can update my friends on my daily life without permanency

    @happy_path
    Scenario: Upload a Story
        Given I am logged in as "UserA"
        When I click the "Add Story" button in the sidebar
        And I select a valid image file "vacation.jpg"
        And I submit the upload
        Then my avatar ring in the Stories bar should become active
        And "UserB" should see my updated avatar ring in their Stories bar

    @happy_path
    Scenario: Record Story from Camera
        Given I am logged in as "UserA"
        When I click the "Record" button in the Stories bar
        Then the camera modal should open
        When I grant camera permissions
        And I start recording
        And I record for 5 seconds
        And I stop recording
        Then the story should be uploaded automatically
        And my avatar ring in the Stories bar should become active

    @happy_path
    Scenario: View a Story
        Given I am logged in as "UserB"
        And "UserA" has posted a story
        When I click on "UserA"'s avatar in the Stories bar
        Then the Story Viewer modal should open
        And I should see "UserA"'s story content
        And the story should auto-advance after 5 seconds

    @unhappy_path
    @pending
    Scenario: Upload Invalid File Type
        Given I am logged in as "UserA"
        When I attempt to upload a file "document.pdf" as a story
        Then the upload should fail
        And I should see an error message "Unsupported file type"

    @pending
    Scenario: Camera Permission Denied
        Given I am logged in as "UserA"
        When I click the "Record" button in the Stories bar
        Then the camera modal should open
        When I deny camera permissions
        Then I should see an error message "Camera access denied"
        And the camera modal should close

    @pending @security
    Scenario: Unauthorized Story Deletion
        Given "UserA" has posted a story
        And I am logged in as "MaliciousUser"
        When I attempt to delete "UserA"'s story via the API
        Then I should receive a 403 Forbidden response
        And "UserA"'s story should still exist

    @pending
    Scenario: Story Expiration (24 Hours)
        Given "UserA" posted a story 25 hours ago
        When "UserB" logs in and views the Stories bar
        Then "UserA"'s avatar ring should not be active
        And "UserB" should not be able to view "UserA"'s expired story
