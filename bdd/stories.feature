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
