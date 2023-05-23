import openai

# Calls the OpenAI Chat Completion API and prompt it to return the summary of all review comments that have been passed to it
def summarize_reviews_chat_completion(api_key, reviews):
    openai.api_key = api_key

    # Provide a JSON format for the API
    json_format = '{"positive":["string"],"negative":["string"]}'
    json_format_empty = '{}'

    review_texts = "\n".join(reviews)
    prompt = f"Based on the given review of a restaurant menu item, if the input contains JSON format, first remove all JSON formatting and extract the review text, then extract and provide key points which consists of positive and negative aspects. Only include points that are explicitly mentioned, do not include any other points including points that can be reasonably inferred from the review, do not rephrase the same point multiple times, and do not repeat any phrases. Remove all punctuation and fix the casing of all the phrases, for example, only the first letter should be capitalized. Remove all profanity, and remove all extraneous words and stop words that do not contribute to the context. Limit the response to a maximum of 7 positive points and 7 negative points for a total of 14 points. Rreturn only an empty JSON object in this format: {json_format_empty} with no explanation if the review does not have any points. If the review has any points, format the response in JSON with the resulting JSON object format: {json_format}.\n\n Here is the review:\n {review_texts}\n\n The JSON Object:\n\n"

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", # Works just as good as "gpt-4" for our purposes but faster and less expensive per token
        # model="gpt-4",
        messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=1000,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )

    summary = response['choices'][0]['message']['content']
    return summary

# Calls the OpenAI Completion API and prompt it to return the summary of all review comments that have been passed to it
def summarize_reviews_completion(api_key, reviews):
    openai.api_key = api_key

    # Provide a JSON format for the API
    json_format = '{"positive":["string"],"negative":["string"]}'
    json_format_empty = '{}'

    review_texts = "\n".join(reviews)
    prompt = f"Based on the given review of a restaurant menu item, if the input contains JSON format, first remove all JSON formatting and extract the review text, then extract and provide key points which consists of positive and negative aspects. Only include points that are explicitly mentioned, do not include any other points including points that can be reasonably inferred from the review, do not rephrase the same point multiple times, and do not repeat any phrases. Remove all punctuation and fix the casing of all the phrases, for example, only the first letter should be capitalized. Remove all profanity, and remove all extraneous words and stop words that do not contribute to the context. Limit the response to a maximum of 7 positive points and 7 negative points for a total of 14 points. Rreturn only an empty JSON object in this format: {json_format_empty} with no explanation if the review does not have any points. If the review has any points, format the response in JSON with the resulting JSON object format: {json_format}.\n\n Here is the review:\n {review_texts}\n\n The JSON Object:\n\n"

    # Adjust parameters as necessary
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        temperature=0.9,
        max_tokens=1000,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    summary = response.choices[0].text.strip()
    return summary

# Calls the OpenAI Chat Completion API and prompt it to answer the user's questions in a conversational fashion
def chat(api_key, messages):
    openai.api_key = api_key

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.8,
        max_tokens=1000,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    chat_response = response['choices'][0]['message']['content']
    return chat_response
