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
  let authorizationToken: string = '';
  let methodArn: string = '';
  let effect: 'Deny' | 'Allow' = 'Deny';
  try {
    console.log('event', JSON.stringify(event));
    authorizationToken = event.headers?.authorization || '';
    methodArn = event.methodArn;
    if (!authorizationToken) {
      return generatePolicy(authorizationToken, effect, methodArn);
    }


    const [authType, encodedToken] = authorizationToken.split(' ');
    if (authType !== 'Basic' || !encodedToken) {
      return generatePolicy(authorizationToken, effect, methodArn);
    }

    const [username, password] = Buffer.from(encodedToken, 'base64').toString('utf8').split(':');
    const storedPw = process.env[username];
    effect = (!password || storedPw !== password) ? 'Deny' : 'Allow';

    const policy = generatePolicy(authorizationToken, effect, event.methodArn);
    return policy;
  } catch (err: any) {
    console.log('err', err);
    return generatePolicy(authorizationToken, effect, methodArn);
  }
}