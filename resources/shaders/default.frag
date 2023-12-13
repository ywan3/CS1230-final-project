#version 330 core

in vec3 position_world;
in vec3 normal_world;

out vec4 fragColor;

uniform float ka;
uniform float ks;
uniform float kd;

uniform vec4 cAmbient;
uniform vec4 cDiffuse;
uniform vec4 cSpecular;
uniform float shininess;

// light directions and colors
uniform vec3 light_directions[8];
uniform vec3 light_colors[8];
uniform vec3 light_positions[8];
uniform vec3 light_atts[8];
uniform int light_types[8];
uniform float light_angles[8];
uniform float light_penus[8];



uniform int num_lights;

uniform vec3 camera_pos;

void main() {
//    fragColor = vec4(1.0f);
//    fragColor = vec4(abs(normal_world), 1.0);

    fragColor = vec4(ka * cAmbient[0],
                     ka * cAmbient[1],
                     ka * cAmbient[2],
                     1);

//    normal_world = normalize(normal_world);

    for (int i = 0; i < num_lights; i++) {
        // calculate attenuation
        vec3 light_direction = light_directions[i];
        float fatt = 1.0;


        if (light_types[i] == 0) { // point light
            light_direction = normalize(light_positions[i] - position_world);
            float distanceToLight = distance(light_positions[i], position_world);
//            fatt = min(1.0f, 1/ (light_atts[i].x + light_atts[i].y * distanceToLight + light_atts[i].z * distanceToLight * distanceToLight));
            fatt = 1.0 / (light_atts[i].x + light_atts[i].y * distanceToLight + light_atts[i].z * distanceToLight * distanceToLight);
        }

        else if (light_types[i] == 2) { // spot light
            light_direction = normalize(light_positions[i] - position_world);
            float distanceToLight = distance(light_positions[i], position_world);
//            fatt = min(1.0f, 1/ (light_atts[i].x + light_atts[i].y * distanceToLight + light_atts[i].z * distanceToLight * distanceToLight));
            fatt = 1.0 / (light_atts[i].x + light_atts[i].y * distanceToLight + light_atts[i].z * distanceToLight * distanceToLight);

            float cosAngle = dot(light_direction, normalize(light_directions[i]));
            float angle = acos(cosAngle);

            float theta_outer = light_angles[i];
            float theta_inner = theta_outer - light_penus[i];

            if (angle <= theta_inner) { // inner cone
                fatt *= 1.0f;
            }
            else if (angle <= theta_outer) { // in between
                float falloff = -2.0 * pow((angle - theta_outer) / (theta_inner-theta_outer), 3)
                                + 3.0 * pow((angle - theta_outer) / (theta_inner -theta_outer), 2);

                fatt *= falloff;
            }
            else { // outer cone
                fatt *= 0.0f;
            }
        }


        // diffuse term
        float diffuseDot = dot(normalize(normal_world), light_direction);
        if (diffuseDot > 0) {
//            diffuseDot = clamp(diffuseDot, 0.0, 1.0);
            fragColor += fatt * kd * diffuseDot * cDiffuse * vec4(light_colors[i], 1.0);
        }

        // specular term
        vec3 reflected_direction = reflect(normalize(-light_direction), normalize(normal_world));
        vec3 camera_direction = normalize(camera_pos - position_world);

        float specular_dot = dot(reflected_direction, camera_direction);

        if (specular_dot > 0) {
//            specular_dot = clamp(specular_dot, 0.0, 1.0);
            specular_dot = pow(specular_dot, shininess);
            fragColor += fatt * ks * cSpecular * specular_dot * vec4(light_colors[i], 1.0);
        }

    }
//    float diffuseDot = dot(normalize(normal_world), normalize(light_directions[0]));
//    diffuseDot = clamp(diffuseDot, 0.0, 1.0);

//    fragColor += kd * diffuseDot * cDiffuse * vec4(light_colors[0], 1.0);


}
