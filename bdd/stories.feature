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
    Scenario: Upload Invalid File Type
        Given I am logged in as "UserA"
        When I attempt to upload a file "document.pdf" as a story
        Then the upload should fail
        And I should see an error message "Unsupported file type"

    @unhappy_path
    Scenario: Camera Access Denied
        Given I am logged in as "UserA"
        When I click the "Record" button in the Stories bar
        And I deny camera permissions
        Then I should see a camera permission error
        And the camera modal should close

    @security
    Scenario: Unauthorized Story Deletion
        Given I am logged in as "UserB"
        And "UserA" has a story (ID: "story_a")
        When I attempt to delete story "story_a" via API
        Then I should receive a 403 Forbidden response

    @security
    Scenario: Story Expiration
        Given "UserA" posted a story 24 hours and 1 minute ago
        When I request the stories feed
        Then "UserA"'s story should not be included in the response
