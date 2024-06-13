import { useEventCallback, useIsomorphicLayoutEffect, useMergedRefs } from '@fluentui/react-utilities';
import * as React from 'react';

import { useIsReducedMotion } from '../hooks/useIsReducedMotion';
import { useMotionImperativeRef } from '../hooks/useMotionImperativeRef';
import { animateAtoms } from '../utils/animateAtoms';
import { getChildElement } from '../utils/getChildElement';
import type { AtomMotion, AtomMotionFn, MotionParam, MotionImperativeRef } from '../types';

export type MotionComponentProps = {
  children: React.ReactElement;

  /** Provides imperative controls for the animation. */
  imperativeRef?: React.Ref<MotionImperativeRef | undefined>;

  /**
   * Callback that is called when the whole motion finishes.
   *
   * A motion definition can contain multiple animations and therefore multiple "finish" events. The callback is
   * triggered once all animations have finished with "null" instead of an event object to avoid ambiguity.
   */
  // eslint-disable-next-line @nx/workspace-consistent-callback-type -- EventHandler<T> does not support "null"
  onMotionFinish?: (ev: null) => void;

  /**
   * Callback that is called when the whole motion starts.
   *
   * A motion definition can contain multiple animations and therefore multiple "start" events. The callback is
   * triggered when the first animation is started. There is no official "start" event with the Web Animations API.
   * so the callback is triggered with "null".
   */
  // eslint-disable-next-line @nx/workspace-consistent-callback-type -- EventHandler<T> does not support "null"
  onMotionStart?: (ev: null) => void;
};

/**
 * Creates a component that will animate the children using the provided motion.
 *
 * @param value - A motion definition.
 */
export function createMotionComponent<MotionParams extends Record<string, MotionParam> = {}>(
  value: AtomMotion | AtomMotion[] | AtomMotionFn<MotionParams>,
) {
  const Atom: React.FC<MotionComponentProps & MotionParams> = props => {
    const {
      children,
      imperativeRef,
      onMotionFinish: onMotionFinishProp,
      onMotionStart: onMotionStartProp,
      ..._rest
    } = props;
    const params = _rest as Exclude<typeof props, MotionComponentProps>;
    const child = getChildElement(children);

    const handleRef = useMotionImperativeRef(imperativeRef);
    const elementRef = React.useRef<HTMLElement>();
    const paramsRef = React.useRef<MotionParams>(params);

    const isReducedMotion = useIsReducedMotion();

    const onMotionStart = useEventCallback(() => {
      onMotionStartProp?.(null);
    });

    const onMotionFinish = useEventCallback(() => {
      onMotionFinishProp?.(null);
    });

    useIsomorphicLayoutEffect(() => {
      // Heads up!
      // We store the params in a ref to avoid re-rendering the component when the params change.
      paramsRef.current = params;
    });

    useIsomorphicLayoutEffect(() => {
      const element = elementRef.current;

      if (element) {
        const atoms = typeof value === 'function' ? value({ element, ...paramsRef.current }) : value;
        onMotionStart();

        const handle = animateAtoms(element, atoms, { isReducedMotion: isReducedMotion() });

        handle.onfinish = onMotionFinish;
        handleRef.current = handle;

        return () => {
          handle.cancel();
        };
      }
    }, [handleRef, isReducedMotion, onMotionFinish, onMotionStart]);

    return React.cloneElement(children, { ref: useMergedRefs(elementRef, child.ref) });
  };

  return Atom;
}
