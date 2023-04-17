/* eslint-disable @next/next/no-img-element */
import NavigationBar from 'components/molecules/NavigationBar'
import { getAllFairytaleSlugs, getFairytale } from 'lib/sanity.client'
import { iFairytale } from 'lib/sanity.queries'
import { GetStaticProps } from 'next'
import Image from 'next/image'
import { useState } from 'react'

interface PageProps {
  fairytale: iFairytale
}

interface Query {
  [key: string]: string
}

const generateNewStoryImage = async () => {
  // Add your code here
}

const handleGenerateStory = async () => {
  // Add your code here
}

const FairtalePage = ({ fairytale }: PageProps) => {
  const [storyImage, setStoryImage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [keywords, setKeywords] = useState('');

  const generateKeywords = async () => {
    const prompt = 'Give us an highly detailed image prompt for this story:\n\n' + fairytale.generateText;
    console.log(prompt);
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {  "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt, maxToken: 500, temperature: 0.5 }),
    });
    const data = await response.json();
    const text = data.text ? data.text : fairytale.title;
    const splitText = text.split('Image Prompt:');
    return splitText[1];
  }

  const generateNewStoryImage = async (keywords) => {
    // Add code here to genereate a new story image based on sanity data, be creative!
    const imagePromt = 'Can you create an image for this story in the style of Kittelsen' + keywords;

    try {
      const response = await fetch('/api/openai-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePromt,
        }),
      }).then((res) => res.json())

      if (response.text) {
        setStoryImage(response.text)
      } else {
        console.log('error')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleGenerateImage = async () => {
    setIsLoading(true)
    const _keywords = await generateKeywords()
    setKeywords(_keywords);
    console.log(_keywords);
    await generateNewStoryImage(_keywords)
    setIsLoading(false)
  }

  return (
    <>
      <NavigationBar />
      <div className="px-12 pt-8">
        <h1 className="pb-5">{fairytale.title}</h1>
        <p>
          {fairytale.generateText}
        </p>
        <main className="pb-10">
          <button
            className="self-center px-2 m-5 text-center rounded-md bg-slate-200"
            onClick={handleGenerateImage}
          >
            Generate keywords, and image
          </button>
          <p className="py-5">Prompt: {keywords}</p>
          {isLoading && <p>Loading...</p>}

          {storyImage && (
            <Image src={storyImage} alt="" width={512} height={512} />
          )}
        </main>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps, Query> = async (ctx) => {
  // Get the slug from the context
  const { params = {} } = ctx

  // Fetch the fairytale with the given slug
  const [fairytale] = await Promise.all([getFairytale(params.slug)])

  // If no fairytale was found, return 404
  if (!fairytale) {
    return {
      notFound: true,
    }
  }

  // Return the fairytale for Next.js to use
  return {
    props: {
      fairytale,
      // revalidate every two hours
      revalidate: 60 * 60 * 2,
    },
  }
}

export const getStaticPaths = async () => {
  // Fetch all fairytale slugs
  const slugs = await getAllFairytaleSlugs()

  return {
    paths: slugs?.map(({ slug }) => `/fairytale/${slug}`) || [],
    fallback: 'blocking',
  }
}

export default FairtalePage
