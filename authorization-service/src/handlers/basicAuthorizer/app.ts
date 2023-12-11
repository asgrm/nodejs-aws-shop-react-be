import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import 'dotenv/config';

function generatePolicy(principalId: string, effect: string, resource: string) {
  return ({
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  });
}

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<any> => {
  try {
    console.log('event', JSON.stringify(event));

    console.log('process.env', process.env);

    const { authorizationToken } = event;
    if (!authorizationToken) {
      throw new Error('Unauthorized');
    }

    const [authType, encodedToken] = authorizationToken.split(' ');
    if (authType !== 'Basic' || !encodedToken) {
      throw new Error('Unauthorized');
    }

    const [username, password] = Buffer.from(encodedToken, 'base64').toString('utf8').split(':');

    const storedPw = process.env[username];

    const effect = (!password || storedPw !== password) ? 'Deny' : 'Allow';

    return generatePolicy(authorizationToken, effect, event.methodArn);

  } catch (err: any) {
    console.log('err', err);
    throw new Error('Unauthorized'); // 401
  }
}