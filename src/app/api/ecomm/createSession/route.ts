import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'
import Stripe from 'stripe'

import { errorResponse, successResponse } from '../../responses'

export async function POST(request: Request) {
  try {
    const session = getKindeServerSession()
    if (!session) return errorResponse('Unauthorized', 401)
    const user = await session.getUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { productType, productId } = (await request.json()) as {
      productType: 'curatedSet' | 'course'
      productId: string
    }

    if (!productType || !productId)
      return errorResponse('Missing required fields', 400)

    const { price, name } = await getProductDetails(productType, productId)

    if (!price || !name) return errorResponse('Product not found', 404)

    const referrer = request.headers.get('Referer')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: 'GBP',
            product_data: {
              name: name,
              metadata: {
                productId,
                productType,
              },
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
      cancel_url: referrer ?? `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      automatic_tax: { enabled: true },
    })

    if (!checkoutSession.url)
      return errorResponse('Error creating session', 500)

    // Now that we have the session, before redirecting to Stripe, we need to save the session ID with the user in the database
    await prisma.checkoutSession.create({
      data: {
        sessionId: checkoutSession.id,
        userId: user.id,
        items: {
          createMany: {
            data: [
              {
                productType,
                productId: productId.toString(),
              },
            ],
          },
        },
      },
    })

    return successResponse('Session created', { url: checkoutSession.url }, 200)
  } catch (e) {
    // Sentry.captureException(e)
    console.error(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

async function getProductDetails(
  productType: 'curatedSet' | 'course',
  productId: string,
) {
  try {
    if (productType === 'curatedSet') {
      const set = await prisma.curatedSet.findFirst({
        where: {
          id: parseInt(productId),
        },
      })
      if (!set) throw new Error('Set not found')
      return { price: set.price, name: set.name }
    } else if (productType === 'course') {
      const course = await prisma.course.findFirst({
        where: {
          id: productId,
        },
      })
      if (!course) throw new Error('Course not found')
      return { price: course.price, name: course.courseName }
    } else {
      throw new Error('Invalid product type')
    }
  } catch (e) {
    return { price: undefined, name: undefined }
  }
}
