import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  status: string
  message: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.status(200).json({ 
    status: 'success', 
    message: 'API connection successful!' 
  })
} 