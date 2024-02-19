import { prisma } from '~/server/db'

import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/dist/types'
import * as Sentry from '@sentry/nextjs'
import Stripe from 'stripe'

export async function CreateCheckoutSession(
  products: { productType: 'curatedSet' | 'course'; productId: string }[],
  returnUrl: string,
  user: KindeUser,
) {
  try {
    const lineItems = await Promise.all(
      products.map(async (product) => {
        const { price, name } = await getProductDetails(
          product.productType,
          product.productId,
        )
        if (!price || !name) throw new Error('Product not found')

        return {
          price_data: {
            currency: 'GBP',
            product_data: {
              name,
              metadata: {
                productId: product.productId,
                productType: product.productType,
              },
            },
            unit_amount: price,
          },
        }
      }),
    )

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      customer_email: user.email ?? undefined,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
      cancel_url: returnUrl ?? `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      automatic_tax: { enabled: true },
    })

    if (!checkoutSession.url) throw new Error('Session creation failed')

    // Now that we have the session, before redirecting to Stripe, we need to save the session ID with the user in the database
    await prisma.checkoutSession.create({
      data: {
        sessionId: checkoutSession.id,
        userId: user.id,
        items: {
          createMany: {
            data: products.map((product) => ({
              productId: product.productId,
              productType: product.productType.toString(),
            })),
          },
        },
      },
    })

    return checkoutSession.url
  } catch (e) {
    Sentry.captureException(e)
    return undefined
  }
}

export async function getProductDetails(
  productType: 'curatedSet' | 'course',
  productId: string,
) {
  try {
    if (productType === 'curatedSet') {
      const set = await prisma.curatedSet.findFirst({
        where: {
          id: productId,
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
