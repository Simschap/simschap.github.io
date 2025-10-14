# This script reads the Streamlit app code and the HTML template,
# combines them, and writes the final, single index_org.html file.

# Define the names of your files
python_file = "main.py"
template_file = "template.html"
output_file = "index.html"

try:
    # Read the content of the Python script
    with open(python_file, "r", encoding="utf-8") as f:
        python_code = f.read()

    # Read the content of the HTML template
    with open(template_file, "r", encoding="utf-8") as f:
        html_template = f.read()

    # Replace the placeholder in the template with the Python code
    # Note: We escape backticks ` within the python code to avoid issues
    final_html = html_template.replace("{PYTHON_SCRIPT_CONTENT}", python_code.replace('`', '\\`'))

    # Write the final combined content to index_org.html
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(final_html)

    print(f"Successfully built '{output_file}' from '{python_file}' and '{template_file}'.")

except FileNotFoundError as e:
    print(f"Error: Could not find a required file. Make sure '{python_file}' and '{template_file}' are in the same directory.")
    print(f"Details: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")

