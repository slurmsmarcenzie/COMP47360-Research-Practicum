import time
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select
from selenium.webdriver.common.action_chains import ActionChains

def test_dropdown_selection(driver):

    # test case to validate that all the chosen outputs are expected
    # asserting that each value matches as expected
    # index - 1 as the first option in our dropdown cannot be chosen

    wait = WebDriverWait(driver, 5)
    dropdown = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-nav-dropdown")))

    all_dropdown_values = [
        'Thanksgiving Day Parade',
        'Halloween Parade and Party',
        "Saint Patrick's Day Parade",
        "NYC Pride March",
        "Times Square Ball",
        "Lunar New Year Parade",
        "Three Kings Day Parade",
        "4th of July Fireworks"
    ]

    select = Select(dropdown)

    for i in range(1,9):
        time.sleep(1)
        select.select_by_index(i)
        time.sleep(1)
        selected_option = select.first_selected_option
        assert selected_option.text.strip() == all_dropdown_values[i-1], f'The wrong option is selected, expected {all_dropdown_values[i]} but got {selected_option.text}'

def test_single_dropdown(driver):

    # test to select value from single dropdown - operates as per above

    wait = WebDriverWait(driver, 5)
    dropdown = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-nav-dropdown")))
    time.sleep(1)
    select = Select(dropdown)
    select.select_by_index(1)
    time.sleep(1)

    selected_option = select.first_selected_option
    assert selected_option.text == 'Thanksgiving Day Parade', 'The wrong option is selected'

def test_CTA_button(driver):

    # here we select a value from the dropdown to ensure that our button populates
    # after we hit the CTA button we should generate a new CTA button that allows for dual display
    # if the css selector of cta is not none we have passed    

    wait = WebDriverWait(driver, 5)
    test_single_dropdown(driver)
    time.sleep(1)
    CTA_button = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-nav-cta-button")))
    CTA_button.click()
    time.sleep(1)

    new_CTA_button = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-nav-cta-button")))
    assert new_CTA_button is not None

def test_go_back_button(driver):

    # here we want to test that we are able to return back to the original screen state having chosen some items
    # the pass value here is to ensure that the conditional floating infobox (where the button is located) is no longer visible

    wait = WebDriverWait(driver, 5)

    go_back_button = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-info-box-back-button")))
    go_back_button.click()
    time.sleep(1)
    
    try:
        is_invisible = wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, ".floating-info-box")))
        assert is_invisible, "The '.floating-info-box' is still visible."
    except:
        assert False, "Timeout: The '.floating-info-box' did not become invisible within the time limit."


def test_click_area_no_event(driver):

    # test here is to make sure that there is no cta button when a user selects an area where there is no event taking place
    wait = WebDriverWait(driver, 5)
    
    # Get the Mapbox container (update CSS selector as needed)
    mapbox = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".mapboxgl-canvas")))

    time.sleep(1)
    
    # Perform action chains
    actions = ActionChains(driver)
    actions.move_to_element_with_offset(mapbox, 50, 50)  # Provide the x and y offset relative to top left corner
    actions.click()
    actions.perform()
    time.sleep(1)
    go_back_button = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-info-box-back-button")))
    go_back_button.click()

    try:
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".floating-nav-cta-button")))
        assert False, "Failure: The CTA button is still present."
    except:
        pass


def test_click_area_with_event(driver):

    # we want to click an area, hit the CTA button and see if another CTA button is generated to pass

    wait = WebDriverWait(driver, 5)
    
    # Get the Mapbox container (update CSS selector as needed)
    mapbox = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".mapboxgl-canvas")))

    time.sleep(1)
    # Perform action chains
    actions = ActionChains(driver)
    actions.move_to_element_with_offset(mapbox, 50, 100)  # Provide the x and y offset relative to top left corner
    actions.click()
    actions.perform()
    time.sleep(1)

    CTA_button = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-nav-cta-button")))
    CTA_button.click()
    time.sleep(1)

    new_CTA_button = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-nav-cta-button")))
    assert new_CTA_button is not None

def test_compare_map(driver):
    
    # test whether the compare map function works

    wait = WebDriverWait(driver, 5)

    compare_button = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-nav-cta-button")))
    compare_button.click()
    time.sleep(1)
    timelapse_button = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".timelapse-button")))
    timelapse_button.click()
    time.sleep(6)
    timelapse_button.click()
    time.sleep(1)
    return_to_single_map = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".split-view-controller-toggle-button")))
    return_to_single_map.click()
    time.sleep(1)

    new_CTA_button = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-nav-cta-button")))
    assert new_CTA_button is not None


def test_toggle_states(driver):

    # test whether the toggle states for updating the maps colours works

    wait = WebDriverWait(driver, 5)

    toggle_baseline = wait.until(EC.visibility_of_element_located((By.XPATH, '//label[@for="baselineBusyness"]')))
    toggle_baseline.click()
    time.sleep(1)

    toggle_impact = wait.until(EC.visibility_of_element_located((By.XPATH, '//label[@for="eventImpact"]')))
    toggle_impact.click()
    time.sleep(1)

    new_CTA_button = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-nav-cta-button")))
    assert new_CTA_button is not None

def test_toggle_filter_views(driver):

    # test whether the toggle states for updating the map views works

    wait = WebDriverWait(driver, 10)

    toggle_view = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".accordion-item:nth-of-type(2)")))
    toggle_view.click()
    time.sleep(1)

    button_titles = [
        "Highlight Busiest Zones",
        "Highlight Least Busy Zones",
        "Highlight Zones Most Impacted by Event",
        "Highlight Zones Least Impacted by Event",
    ]

    for title in button_titles:
        toggle_view = wait.until(EC.visibility_of_element_located((By.XPATH, f"//div[@title='{title}']")))
        toggle_view.click()
        time.sleep(1)

        assert toggle_view.get_attribute("title") == title, f"Expected title '{title}', but got '{toggle_view.get_attribute('title')}'"


    toggle_view = wait.until(EC.visibility_of_element_located((By.XPATH, f"//div[@title='{button_titles[3]}']")))
    toggle_view.click()
    time.sleep(1)

def test_display_chart(driver):

    # test to ensure that our chart function is firing correctly
    # we want to select the chart and then ensure that it is creating the chart for the dropdown value correctly

    wait = WebDriverWait(driver, 10)

    show_chart = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".accordion-item:nth-of-type(1)")))
    show_chart.click()
    time.sleep(1)
    
    line_chart_container = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".line-chart-container")))
    assert line_chart_container is not None

    dropdown = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".floating-nav-dropdown")))
    time.sleep(1)
    select = Select(dropdown)
    select.select_by_index(1)

    selected_option = select.first_selected_option
    assert selected_option.text == 'Bloomingdale', 'The wrong option is selected'
    assert line_chart_container is not None

def hover_over_coordinates(driver, map_element, x, y):
    ActionChains(driver).move_to_element_with_offset(map_element, x, y).perform()

def test_map_hover(driver):

    # visual test to ensure that the map can be hovered over

    wait = WebDriverWait(driver, 10)
    map_element = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".mapboxgl-canvas")))

    # The height of the map element.
    map_height = (map_element.size["height"] - 5)//3

    # Vary the y-coordinate and keep x constant
    for y in range(0, map_height, 4):  # You can adjust the step size according to your needs
        hover_over_coordinates(driver, map_element, 0, y)
        assert map_element is not None

def main():
    driver = webdriver.Chrome()  # or webdriver.Chrome()
    driver.get('http://localhost:3000')  # update with your app's URL

    try:
        print("Running test: test_dropdown_selection")
        test_dropdown_selection(driver)
        print("Test passed: test_dropdown_selection")
        
        print("Running test: test_single_dropdown")
        test_single_dropdown(driver)
        print("Test passed: test_single_dropdown")
        
        print("Running test: test_CTA_button")
        test_CTA_button(driver)
        print("Test passed: test_CTA_button")
        
        print("Running test: test_go_back_button")
        test_go_back_button(driver)
        print("Test passed: test_go_back_button")
        
        print("Running test: test_click_area_no_event")
        test_click_area_no_event(driver)
        print("Test passed: test_click_area_no_event")
        
        print("Running test: test_click_area_with_event")
        test_click_area_with_event(driver)
        print("Test passed: test_click_area_with_event")

        print("Running test: test_compare_map")        
        test_compare_map(driver)
        print("Passed test: test_compare_map")

        print("Running test: test_toggle_states")
        test_toggle_states(driver)
        print("Passed test: test_toggle_states")

        print("Running test: test_toggle_filter_views")
        test_toggle_filter_views(driver)
        print("Passed test: test_toggle_filter_views")
        
        print("Running test: test_display_chart")
        test_display_chart(driver)
        print("Passed test: test_display_chart")

        print("Running test: test_map_hover")
        test_map_hover(driver)
        print("Passed test: test_map_hover")

    finally:
        driver.quit()

if __name__ == '__main__':
    main()
