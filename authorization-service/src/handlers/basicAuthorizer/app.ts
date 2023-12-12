import { APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';

function generatePolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string
): APIGatewayAuthorizerResult {
  return ({
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: [resource],
        },
      ],
    },
  });
}

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  try {
    console.log('event', JSON.stringify(event));
    const authorizationToken = event.headers?.authorization;
    if (!authorizationToken) {
      throw new Error('Unauthorized');
    }

    const [authType, encodedToken] = authorizationToken.split(' ');
    if (authType !== 'Basic' || !encodedToken) {
      return generatePolicy(authorizationToken, 'Deny', event.methodArn);
    }

    const [username, password] = Buffer.from(encodedToken, 'base64').toString('utf8').split(':');
    const storedPw = process.env[username];
    const effect = (!password || storedPw !== password) ? 'Deny' : 'Allow';

    const policy = generatePolicy(authorizationToken, effect, event.methodArn);
    return policy;
  } catch (err: any) {
    console.log('err', err);
    throw new Error('Unauthorized'); // 401
  }
}